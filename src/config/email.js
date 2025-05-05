const nodemailer = require("nodemailer");
require("dotenv").config();


const USER_EMAIL = process.env.USER_EMAIL;  // Địa chỉ email gửi
const USER_PASSWORD = process.env.USER_PASSWORD;  // Mật khẩu email của bạn (hoặc mật khẩu ứng dụng nếu sử dụng 2FA)
console.log("USER_EMAIL", USER_EMAIL);
console.log("USER_PASSWORD", USER_PASSWORD);
// Cấu hình transporter
const transporter = nodemailer.createTransport({
    service: "gmail",  // Bạn có thể thay đổi service email ở đây (ví dụ Gmail, Outlook,...)
    auth: {
        user: USER_EMAIL,  // Địa chỉ email gửi
        pass: USER_PASSWORD    // Mật khẩu email của bạn (hoặc mật khẩu ứng dụng nếu sử dụng 2FA)
    }
});

// Hàm gửi email
const sendEmail = (to, subject, htmlContent) => {
    const mailOptions = {
        from: USER_EMAIL,  // Địa chỉ email gửi
        to: to,  // Địa chỉ email người nhận
        subject: subject,  // Tiêu đề email
        html: htmlContent  // Nội dung email dạng HTML
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);  // Nếu có lỗi thì reject promise
            } else {
                resolve(info.response);  // Nếu thành công, resolve promise
            }
        });
    });
};

module.exports = { sendEmail };