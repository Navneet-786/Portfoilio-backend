import app from "./app.js";
import "./config/cloudinary.js";
import "dotenv/config";

app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});
