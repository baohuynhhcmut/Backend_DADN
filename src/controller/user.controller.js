const UserModel = require("../model/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");


const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists by email
        const existUser = await UserModel.findOne({ email });

        if (!existUser) {
            return res.status(400).json({ message: "User not found!" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, existUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password!" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: existUser._id, email: existUser.email, role: existUser.role },
            process.env.JWT_SECRET, //dotenv
            { expiresIn: "1d" } // Token hết hạn sau 1 ngày
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: existUser._id,
                email: existUser.email,
                role: existUser.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const RegisterUser =  async (req,res) => {
    try {
        const { email,password} = req.body

        // Check if user exist by email
        const existUser = await UserModel.findOne({
            email:email
        })

        if(existUser){
            res.status(400).json({
                message:'User already exists!'
            })
            return
        }

        // Hashing password before save in DB
        const passwordHashing= bcrypt.hashSync(password, 10);

        const newUser = new UserModel({
            email:email,
            password:passwordHashing,
            role:"USER"
        })
        
        await newUser.save()

        res.status(201).json({
            status:201,
            message: 'Create new user success',
            data: newUser
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server error'
        })
    }
}


const GetUserInfoByEmail = async(req,res) => {
    try {
        const { email } = req.query
        const exitUser = await UserModel.findOne({email})
        if(!exitUser){
            res.status(404).json({
                message:'User don`t exist!'
            })
            return
        }
        res.status(200).json({
            status:200,
            message:'Find user success',
            data: exitUser
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server error'
        })
    }
}   

const GetAllUser = async (req,res) => {
    try {
        const allUser = await UserModel.find({})
        res.status(200).json({
            status:200,
            message:'Find all user success',
            data: allUser
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server error'
        })
    }
}

module.exports = {
    LoginUser,
    RegisterUser,
    GetUserInfoByEmail,
    GetAllUser
}
