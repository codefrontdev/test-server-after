const Users = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



exports.registerController = async (req, res) => {

    const { email, password } = req.body;
    try {
        const exisitinUser = await Users.findOne({email: email});
        if (exisitinUser) {
            return res.status(200).send({
                success: false,
                message: 'User ALready exists'
            });
        }

        // hash password

        const salt = await bcrypt.genSalt(10);

        req.body.password = await bcrypt.hash(password, salt);
        // rest data
        const newUser = new Users(req.body);

        await newUser.save();

        return res.status(201).send({
            success: true,
            message: 'User Registerd Successfully',
            user: newUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error In Register API',
            error
        })
    }
}


// login call back


exports.loginController = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await Users.findOne({email});

        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'User Not Found'
            });
        }

        // check role
        if (user.role !== req.body.role) {
            return res.status(500).send({
                success: false,
                message: 'role dosent match'
            });
        }

        // compare password

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            return res.status(500).send({
                success: false,
                message: 'Invalid Credentials'
            });
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});

        return res.status(200).send({
            success: true,
            message: 'Login Successfuly',
            token,
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error In Login API',
            error
        });
    }
}



// GET CURRENT USER
exports.currentUserController = async (req, res) => {
    try {
        const user = await Users.findOne({_id: req.body.userId});
        return res.status(200).send({
            success: true,
            message: 'User Fetched Successfuly',
            user,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'unable to get current user',
            error
        });
    }
}