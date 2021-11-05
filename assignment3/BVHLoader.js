/*
 * CSCI-712 Assignment #3: moCap
 * Michael Walia - mpw2217
 *
 * Parse-bvh.js's function is to read BVH files and
 * convert them for use in Three.js Bones. Once I have
 * Three.js Bones I can animate them in Three.js.
 */

/*
    Sources to help parse and animate the BVH:
    https://threejs.org/docs/#api/en/helpers/SkeletonHelper
    https://threejs.org/examples/?q=loader#webgl_loader_bvh
    https://research.cs.wisc.edu/graphics/Courses/cs-838-1999/Jeff/BVH.html
    https://github.com/herzig/BVHImporter #modified
*/
var BVHimportData = new function() {

    /*
        Converts the BVH skeletal animation to Three.Bones and an animation clip.
    */
    this.sendToThree = function (bone) {

        var threeBonesList = [];
        sendToThreeBone(bone, threeBonesList);

        return {
            skeleton: new THREE.Skeleton(threeBonesList),
            clip: sendToThreeAnimation(bone)
        }

            ;
    }

    /*
        Converts the internal BVH node structure to a Three.Bone hierarchy.
    */
    function sendToThreeBone(source, list) {
        var bone = new THREE.Bone();
        list.push(bone);
        bone.position.add(source.offset);
        bone.name = source.name;

        if (source.type != "ENDSITE")  {
            for (var i = 0; i < source.children.length; ++i) {
                bone.add(sendToThreeBone(source.children[i], list));
            }
        }

        return bone;
    }

    /*
        Builds the Three.animationclip from the keyframe data in Three.bone.
    */
    function sendToThreeAnimation(bone) {

        var bones = [];
        flattenNodeHierarchy(bone, bones);

        var tracks = [];

        // Creates a position and animates each node.
        for (var i = 0; i < bones.length; ++i) {
            var b = bones[i];

            if (b.type == "ENDSITE")
                continue;

            // Records the time, position, and rotations of each joint.
            var times = [];
            var positions = [];
            var rotations = [];

            for (var j = 0; j < b.frames.length; ++j) {
                var f = b.frames[j];
                times.push(f.time);
                positions.push(f.position.x + b.offset.x);
                positions.push(f.position.y + b.offset.y);
                positions.push(f.position.z + b.offset.z);

                rotations.push(f.rotation.x);
                rotations.push(f.rotation.y);
                rotations.push(f.rotation.z);
                rotations.push(f.rotation.w);
            }

            tracks.push(new THREE.VectorKeyframeTrack(
                ".bones["+b.name+"].position", times, positions));

            tracks.push(new THREE.QuaternionKeyframeTrack(
                ".bones["+b.name+"].quaternion", times, rotations));
        }

        var clip = new THREE.AnimationClip("animation", -1, tracks);

        return clip;
    }


    /*
        Reads the BVH file.
    */
    this.readBVHFile = function(lines) {

        // Reads the model's structure.
        if (lines.shift().trim().toUpperCase() != "HIERARCHY")
            throw "HIERARCHY expected";

        var list = [];
        var root = BVHimportData.readingNode(lines, lines.shift().trim(), list);

        // Reads the motion data.
        if (lines.shift().trim().toUpperCase() != "MOTION")
            throw "MOTION  expected";

        var tokens = lines.shift().trim().split(/[\s]+/);

        // Number of Frames
        var numFrames = parseInt(tokens[1]);
        if (isNaN(numFrames))
            throw "Failed to read number of frames.";

        // The Frame Time
        tokens = lines.shift().trim().split(/[\s]+/);
        var frameTime = parseFloat(tokens[2]);
        if (isNaN(frameTime))
            throw "Failed to read frame time.";

        // Read each frame.
        for (var i = 0; i < numFrames; ++i) {
            tokens = lines.shift().trim().split(/[\s]+/);

            BVHimportData.readingFrameData(tokens, i*frameTime, root, list);
        }

        return root;
    }

    /*
     Recursively reads the BVH file to return each BVH node with children.
    */
    this.readingNode  = function(lines, firstline, list) {
        var node = {name: "", type: "", frames: []};
        list.push(node);

        // Reads what type the node is and its name..
        var tokens = firstline.trim().split(/[\s]+/)

        if (tokens[0].toUpperCase() === "END" && tokens[1].toUpperCase() === "SITE") {
            node.type = "ENDSITE";
            node.name = "ENDSITE"; // The end sites contain no moCap data.
        }
        else {
            node.name = tokens[1];
            node.type = tokens[0].toUpperCase();
        }

        // Removes the opening bracket.
        if (lines.shift().trim() != "{")
            throw "Expected opening { after type & name";

        // Reads the offset.
        tokens = lines.shift().trim().split(/[\s]+/);

        if (tokens[0].toUpperCase() != "OFFSET")
            throw "Expected OFFSET, but got: " + tokens[0];
        if (tokens.length != 4)
            throw "OFFSET: Invalid number of values";

        var offset = {
            x: parseFloat(tokens[1]), y: parseFloat(tokens[2]), z: parseFloat(tokens[3]) };

        if (isNaN(offset.x) || isNaN(offset.y) || isNaN(offset.z))
            throw "OFFSET: Invalid values";

        node.offset = offset;

        // Read the channels definition.
        if (node.type != "ENDSITE") {
            tokens = lines.shift().trim().split(/[\s]+/);

            if (tokens[0].toUpperCase() != "CHANNELS")
                throw "Expected CHANNELS definition";

            var numChannels = parseInt(tokens[1]);
            node.channels = tokens.splice(2, numChannels);
            node.children = [];
        }

        // Read each of the child nodes.
        while (true) {
            var line = lines.shift().trim();

            if (line == "}") {
                return node;
            }
            else {
                node.children.push(BVHimportData.readingNode(lines, line, list));
            }
        }
    }

    /*
        This function uses recursion to read the data from one frame in the bone hierarchy.
        This bone hierarchy is structured the same way as the BVH data.
        The keyframe data is found in bone.frames.
    */
    this.readingFrameData = function(data, frameTime, bone) {

        if (bone.type === "ENDSITE") // The end sites contain no moCap data.
            return;

        // Adds the keyframe.
        var keyframe = {
            time: frameTime,
            position: { x: 0, y: 0, z: 0 },
            rotation: new Quaternion(),
        };

        bone.frames.push(keyframe);

        // Go through each value for each channel in the nodes.
        for (var i = 0; i < bone.channels.length; ++i) {

            switch(bone.channels[i]) {
                case "Xposition":
                    keyframe.position.x = parseFloat(data.shift().trim());
                    break;
                case "Yposition":
                    keyframe.position.y = parseFloat(data.shift().trim());
                    break;
                case "Zposition":
                    keyframe.position.z = parseFloat(data.shift().trim());
                    break;
                case "Xrotation":
                    var quat = new Quaternion();
                    quat.setFromAxisAngle(1, 0, 0, parseFloat(data.shift().trim()) * Math.PI / 180);

                    keyframe.rotation.multiply(quat);
                    break;
                case "Yrotation":
                    var quat = new Quaternion();
                    quat.setFromAxisAngle(0, 1, 0, parseFloat(data.shift().trim()) * Math.PI / 180);

                    keyframe.rotation.multiply(quat);
                    break;
                case "Zrotation":
                    var quat = new Quaternion();
                    quat.setFromAxisAngle(0, 0, 1, parseFloat(data.shift().trim()) * Math.PI / 180);

                    keyframe.rotation.multiply(quat);
                    break;
                default:
                    throw "invalid channel type";
                    break;
            }
        }

        // Read each child node.
        for (var i = 0; i < bone.children.length; ++i) {
            BVHimportData.readingFrameData(data, frameTime, bone.children[i]);
        }
    }

    /*
        Goes through the nodes' hierachy to build a list of nodes.
  */
    function flattenNodeHierarchy(bone, flatList) {
        flatList.push(bone);

        if (bone.type !== "ENDSITE")
        {
            for (var i = 0; i < bone.children.length; ++i) {
                flattenNodeHierarchy(bone.children[i], flatList);
            }
        }
    }

    /*
    Basic version of a quaternion so we store joint rotations to use
    in the keyframes.
    */
    function Quaternion(x, y, z, w) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = (w === undefined) ? 1 : w;
    }
    Quaternion.prototype.setFromAxisAngle = function(ax, ay, az, angle) {
        var angleHalf = angle * 0.5;
        var sin = Math.sin(angleHalf);

        this.x = ax * sin;
        this.y = ay * sin;
        this.z = az * sin;
        this.w = Math.cos(angleHalf);
    }
    Quaternion.prototype.multiply = function(quat) {
        var a = this, b = quat;

        var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
        var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

        this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
    }
}