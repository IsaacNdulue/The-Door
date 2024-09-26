Door: Seamless Payments for Small Businesses
Door helps small businesses receive payments seamlessly through modern methods, including integration with KoraPay for Naira transactions. This project leverages blockchain technology and traditional payment methods to enhance business payment systems.

Features
Seamless payments: Integrates blockchain and traditional payments.
KoraPay Integration: For receiving payments in Naira.
User-friendly interface: Easy for businesses to sign up and manage payments.

Installation and Setup
git clone https://github.com/isaacndulue/The-Door.git
cd The-Door

Install dependecies
npm install

create a .env and setup the following
port=<Your_Port_Number>
DB=<Your_MongoDB_URI>
mailPassword=<Your_Mail_Password>
host=<Your_Mail_Host>
service=<Your_Mail_Service>
user=<Your_Mail_Username>
jwtSecret=<Your_JWT_Secret>
cloud_name=<Your_Cloudinary_Cloud_Name>
api_key=<Your_Cloudinary_API_Key>
api_secret=<Your_Cloudinary_API_Secret>

start the application
npm run dev


Memory updated
Let's structure the README following best practices for clarity, maintainability, and professionalism.

Door: Seamless Payments for Small Businesses
Door helps small businesses receive payments seamlessly through modern methods, including integration with KoraPay for Naira transactions. This project leverages blockchain technology and traditional payment methods to enhance business payment systems.

Features
Seamless payments: Integrates blockchain and traditional payments.
KoraPay Integration: For receiving payments in Naira.
User-friendly interface: Easy for businesses to sign up and manage payments.
Installation and Setup
Clone the Repository
bash
Copy code
git clone https://github.com/isaacndulue/The-Door.git
cd The-Door
Install Dependencies
bash
Copy code
npm install
Set up Environment Variables
Create a .env file and set up the following:

makefile
Copy code
PORT=<Your_Port_Number>
DB=<Your_MongoDB_URI>
MAIL_PASSWORD=<Your_Mail_Password>
HOST=<Your_Mail_Host>
SERVICE=<Your_Mail_Service>
USER=<Your_Mail_Username>
JWT_SECRET=<Your_JWT_Secret>
CLOUD_NAME=<Your_Cloudinary_Cloud_Name>
API_KEY=<Your_Cloudinary_API_Key>
API_SECRET=<Your_Cloudinary_API_Secret>
Start the Application
bash
Copy code
npm run dev

 #Technologies Used
Node.js for the backend environment.
Express.js for routing and middleware.
MongoDB for the database.
JWT for user authentication.
Bcrypt for password hashing.
Axios for making external API calls.
BlockCypher for blockchain interactions.
Bitcore for crypto address generation.
Cloudinary for media storage.
Nodemailer for sending emails.

API Endpoints
User Sign Up
POST /api/user/signup
req.body
{
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "Doe Enterprises",
  "email": "johndoe@example.com",
  "password": "SecurePassword@1",
  "phoneNumber": "1234567890"
}
sample response
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {
    "email": "johndoe@example.com"
  }
}
Verify OTP
POST /api/user/otp/:id
req.body
{
  "otp": "123456"
}

Resend OTP
POST /api/user/resendOtp

sample request body
{
  "email": "johndoe@example.com"
}

Contribution
At the moment, no specific contribution guides are provided. However, if you have suggestions, questions, or improvements to offer, feel free to reach out via email:

Contact Email: isaacndulue@gmail.com


License
This project is licensed under the ISC License. See the LICENSE file for details.


Login
POST /api/user/login
