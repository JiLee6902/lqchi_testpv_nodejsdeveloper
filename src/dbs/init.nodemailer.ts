'use strict'

import nodemailer, { Transporter } from 'nodemailer';

const transport = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
   }
  
})

export default transport

