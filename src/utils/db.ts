import mongoose from 'mongoose';

const mongoConnect = async () => {
  const connection = await mongoose.connect(process.env.DATABASE_URL as string);
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

export default mongoConnect;
