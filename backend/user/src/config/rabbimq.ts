import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ=async()=>{
    try {
        const connection=await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD
        })

        channel= await connection.createChannel();
        console.log('✅ RabbitMQ connected successfully');
    } catch (error) {
        console.error('❌ RabbitMQ connection failed:', error);
        process.exit(1);
    }
}


export const publishToQueue=async(queueName:string,message:any)=>{

    if(!channel) {
        console.error('❌ RabbitMQ channel is not initialized');
        return;
    }
    try {
        await channel.assertQueue(queueName, { durable: true });//once the message is sent to the queue, it will persist even if RabbitMQ restarts
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`✅ Message sent to queue ${queueName}`);
    } catch (error) {
        console.error(`❌ Failed to publish message to queue ${queueName}:`, error);
    }
}


