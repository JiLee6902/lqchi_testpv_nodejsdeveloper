'use strict'


const templatePassword = (): string => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background: #4CAF50;
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-header img {
                width: 50px;
                margin-bottom: 10px;
            }
            .email-body {
                padding: 20px;
                color: #333333;
                text-align: center;
            }
            .email-body h2 {
                color: #4CAF50;
            }
            .email-body p {
                font-size: 16px;
                margin: 10px 0;
            }
            .email-body .reset-code {
                display: inline-block;
                background: #f4f4f4;
                padding: 10px 20px;
                border: 2px dashed #4CAF50;
                border-radius: 5px;
                font-size: 20px;
                color: #333333;
                margin: 10px 0;
            }
            .email-footer {
                text-align: center;
                background: #f4f4f4;
                padding: 10px;
                color: #777777;
                font-size: 12px;
            }
            .email-footer a {
                color: #4CAF50;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <img src="https://img.icons8.com/fluency/48/password.png" alt="Password Reset">
                <h1>Password Change Request</h1>
            </div>
            <div class="email-body">
                <h2>Change Your Password</h2>
                <p>Hello,</p>
                <p>We received a request to change your password. Use the verification code below to reset it:</p>
                <div class="reset-code">{{token}}</div>
                <p>The code will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="email-footer">
                <p>Need help? <a href="mailto:support@example.com">Contact Support</a></p>
                <p>© 2024 Jilee Company. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `
}

export {
    templatePassword
}