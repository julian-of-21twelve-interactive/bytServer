const { createTransport, getTestMessageUrl } = require('nodemailer')
const { mail } = require('../config/config')

const transport = createTransport({
  host: mail.host,
  port: mail.port,
  auth: {
    user: mail.user,
    pass: mail.pass,
  },
})

const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: mail.fromMail,
    to,
    subject,
    html,
  }

  return transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message sent: %s', info.messageId)

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', getTestMessageUrl(info))
  })
}

module.exports = sendEmail
