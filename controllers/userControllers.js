import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc Auth user/set Token
// route POST api/users/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } else {
        res.status(401);
        throw new Error('Invalid Email or Password');
    }

});

// @desc  user/register
// route POST api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne(({ email }));

    if (userExists) {
        res.status(400);
        throw new Error('User Already Exists');
    };

    const user = await User.create({
        name,
        email,
        password
    });

    if (user) {

        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } else {
        res.status(400);
        throw new Error('Invalid User Data');
    }
    console.log(req.body);
});


// @desc  user/logout 
// route put api/users/logout
// @access Private
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({ message: 'User Logged out' })
});


// @desc  user/get profile 
// route get api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email
    }
    console.log('++++++++++', user);
    res.status(200).json(user);
});


// @desc  user/updtae profile 
// route PUT api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password
        }

        const updateUser = await user.save();

        console.log(updateUser)

        res.status(200).json({
            _id: updateUser._id,
            name: updateUser.name,
            email: updateUser.email
        });

    } else {
        res.status(404);
        throw new Error('User Not Found');
    }
});

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
};