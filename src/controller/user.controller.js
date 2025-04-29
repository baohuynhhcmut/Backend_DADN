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

const GetUserByToken = async(req, res) => {
    
        try {
            const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header
            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }
    
            // Giải mã token để lấy thông tin người dùng
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;
    
            // Tìm người dùng trong cơ sở dữ liệu
            const user = await UserModel.findById(userId).select("-password"); // Không trả về mật khẩu
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            res.status(200).json({
                message: "User information retrieved successfully",
                user,
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error", error: error.message });
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

const GetAllUserRoleUser = async (req,res) => {
        try {
            const allUser = await UserModel.find({role:'USER'}).select("-password");
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

const AddUser = async (req,res) => {
    
    try {
        const { email, password, phone_number, street, city, state, country, latitude, longitude } = req.body

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
            phone_number: phone_number,
            address: {
                street: street,
                city: city,
                state: state,
                country: country,
                latitude: latitude,
                longitude: longitude
            },
            gardens: [],
        })
        
        await newUser.save();

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

const AddGarden = async (req, res) => {
    try {
        const { email, gardens } = req.body;

        // Check if user exists by email
        const existUser = await UserModel.findOne({ email });

        if (!existUser) {
            return res.status(400).json({
                message: 'User doesn`t exist!'
            });
        }

        // Check if gardens is a non-empty array
        if (!Array.isArray(gardens) || gardens.length === 0) {
            return res.status(400).json({
                message: 'Gardens must be a non-empty list'
            });
        }

        // Validate each garden object
        const invalidGardens = gardens.filter(garden => {
            return !garden.name || typeof garden.latitude !== 'number' || typeof garden.longitude !== 'number';
        });

        if (invalidGardens.length > 0) {
            return res.status(400).json({
                message: 'Each garden must have "name", "latitude" (number), and "longitude" (number)'
            });
        }

        // Check for duplicate name or coordinates
        const existingNames = new Set(existUser.gardens.map(g => g.name));
        const existingCoords = new Set(existUser.gardens.map(g => `${g.latitude},${g.longitude}`));

        const duplicateGardens = gardens.filter(garden => {
            const coordKey = `${garden.latitude},${garden.longitude}`;
            return existingNames.has(garden.name) || existingCoords.has(coordKey);
        });

        if (duplicateGardens.length > 0) {
            return res.status(400).json({
                message: 'Some gardens have duplicate name or coordinates with existing gardens',
                duplicates: duplicateGardens
            });
        }

        // Add valid gardens
        existUser.gardens.push(...gardens);
        await existUser.save();

        // Remove password field if populated
        const { password, ...userWithoutPassword } = existUser.toObject();

        res.status(200).json({
            status: 200,
            message: 'Add garden success',
            data: userWithoutPassword
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

const updateUserInfo = async (req, res) => {
    try {
        const { email, phone_number, street, city, state, country, latitude, longitude } = req.body;

        // Check if user exists by email
        const existUser = await UserModel.findOne({ email });

        if (!existUser) {
            return res.status(400).json({
                message: 'User not found!'
            });
        }

        // Get current address to keep the old values
        const currentAddress = existUser.address || {};
        const currentPhoneNumber = existUser.phone_number || null;

        // Create updateData object
        const updateData = {
            phone_number: phone_number || currentPhoneNumber,
            address: {
                street: street || currentAddress.street,
                city: city || currentAddress.city,
                state: state || currentAddress.state,
                country: country || currentAddress.country,
                latitude: latitude || currentAddress.latitude, 
                longitude: longitude || currentAddress.longitude 
            }
        };

        // Perform the update operation
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: email },
            updateData,  // Pass only the fields that need to be updated
            { new: true }  // Return the updated document
        );

        // Remove password before sending response
        const { password, ...userWithoutPassword } = updatedUser.toObject();

        res.status(200).json({
            status: 200,
            message: 'Update user success',
            data: userWithoutPassword
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        // Check if user exists by email
        const existUser = await UserModel.findOne({ email });

        if (!existUser) {
            return res.status(400).json({ message: "User not found!" });
        }

        // Compare old password with the current password in database
        const isMatch = await bcrypt.compare(oldPassword, existUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong old password!" });
        }

        // Hash the new password
        const passwordHashing = await bcrypt.hash(newPassword, 10);  // Use async version for better performance

        // Update password in the database
        await UserModel.findOneAndUpdate(
            { email: email },
            { password: passwordHashing },
            { new: true }
        );

        // Send success response
        res.status(200).json({
            status: 200,
            message: 'Update password successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

const updateGarden = async (req, res) => {
    try {
      const { email, name, newName, latitude, longitude } = req.body;
  
      // 1. Tìm user theo email
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
  
      // 2. Tìm index garden cần update (dựa vào name cũ)
      const gardenIndex = user.gardens.findIndex(g => g.name === name);
      if (gardenIndex === -1) {
        return res.status(404).json({ message: "Garden not found!" });
      }
  
      // 3. Kiểm tra trùng lặp name hoặc lat/lon ở garden khác
      const isDuplicate = user.gardens.some((g, idx) => {
        if (idx === gardenIndex) return false;
        return (
          g.name === newName || 
          (g.latitude === latitude && g.longitude === longitude)
        );
      });
  
      if (isDuplicate) {
        return res.status(400).json({ message: "Duplicate garden name or location!" });
      }
  
      // 4. Cập nhật các trường mới
      const gardenField = {};
      gardenField[`gardens.${gardenIndex}.name`] = newName;
      gardenField[`gardens.${gardenIndex}.latitude`] = latitude;
      gardenField[`gardens.${gardenIndex}.longitude`] = longitude;
  
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { $set: gardenField },
        { new: true }
      );
  
      return res.status(200).json({
        status: 200,
        message: "Garden updated successfully",
        data: updatedUser.gardens
      });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
};

const deleteUser = async (req, res) => {
    
    try {
        const { email } = req.body;

        // Check if user exists by email
        const existUser = await UserModel.findOne({ email });

        if (!existUser) {
            return res.status(400).json({
                message: 'User not found!'
            });
        }

        await UserModel.deleteOne({ email });

        return res.status(200).json({
            status: 200,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
          message: 'Server error'
        });
    }
};

const deleteGarden = async (req, res) => {
    try {
      const { email, name } = req.body;
  
      // Kiểm tra user tồn tại
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User not found!' });
      }
  
      // Kiểm tra garden có tồn tại theo name không
      const gardenExists = user.gardens.some(g => g.name === name);
      if (!gardenExists) {
        return res.status(404).json({ message: 'Garden not found!' });
      }
  
      // Xoá garden theo name
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { $pull: { gardens: { name } } },
        { new: true }
      );
  
      res.status(200).json({
        status: 200,
        message: 'Garden deleted successfully',
        data: updatedUser.gardens
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = {
    LoginUser,
    RegisterUser,
    GetUserByToken,
    GetUserInfoByEmail,
    GetAllUserRoleUser,
    GetAllUser,
    AddUser,
    AddGarden,
    updateUserInfo,
    updatePassword,
    updateGarden,
    deleteUser,
    deleteGarden
}