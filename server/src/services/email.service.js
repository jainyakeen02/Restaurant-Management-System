// Abstract Email Service
// Ready for integration with SendGrid, Amazon SES, or Resend

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Development fallback / Mock
    console.log(`[EMAIL SERVICE MOCK] Sending email to: ${to}`);
    console.log(`[EMAIL SERVICE MOCK] Subject: ${subject}`);
    // console.log(`[EMAIL SERVICE MOCK] HTML: ${html}`);

    // TODO: Integrate actual email provider here using process.env
    // const transporter = nodemailer.createTransport({...})
    // await transporter.sendMail(...)

    return true;
  } catch (error) {
    console.error("[EMAIL SERVICE ERROR] Failed to send email", error);
    // We throw so the notification service knows it failed, 
    // but the controller won't fail the order if handled properly.
    throw new Error("Email provider failed");
  }
};

module.exports = {
  sendEmail,
};
