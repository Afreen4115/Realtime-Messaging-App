import amqp from 'amqplib';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();


export const startSendOtpConsumer = async () => {
    try {
        const connection=await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD
        })

        const channel = await connection.createChannel();

        const queueName = 'send-otp';
        await channel.assertQueue(queueName, { durable: true });

        console.log('✅ Send OTP consumer is running and waiting for messages...');

        channel.consume(queueName, async(message) => {
            if(message){
                try {
                    const {to,subject,html} = JSON.parse(message.content.toString());

                    const transporter=nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465, 
                        auth:{
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASSWORD
                        }
                        
                    });

                    await transporter.sendMail({
                        from: "Afreen Chat app",
                        to,
                        subject,
                        html: html
                    });
                    console.log(`✅ Email sent to ${to} with subject "${subject}"`);

                    channel.ack(message); // Acknowledge the message after processing
                } catch (error) {
                    console.error('❌ Failed to send email:', error);
                }
            }
        })
    } catch (error) {
        console.error('❌ Failed to start Send OTP consumer:', error);
        process.exit(1);
    }
}