// require("dotenv").config();
// const express = require("express");
// const { Configuration, OpenAIApi } = require("openai");

// const app = express();
// app.use(express.json());

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// const port = process.env.PORT || 5000;

// // POST request endpoint
// app.post("/ask", async (req, res) => {
//   // getting prompt question from request
//   const prompt = req.body.prompt;

//   try {
//     if (prompt == null) {
//       throw new Error("Uh oh, no prompt was provided");
//     }

//     const response = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt,
//       max_tokens: 64,
//     });

//     const completion = response.data.choices[0].text;

//     // console.log(response)
//     // return the result
//     return res.status(200).json({
//       success: true,
//       message: completion,
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// });

// app.listen(port, () => console.log(`Server is running on port ${port}!!`));
require("dotenv").config();
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const cors = require("cors"); // Import the CORS package

const app = express();
app.use(express.json());
app.use(cors({
  origin : "https://colabify-beryl.vercel.app"
}));
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const port = process.env.PORT || 5000;

// POST request endpoint
app.post("/ask", async (req, res) => {
  // getting prompt question from request
  const prompt = req.body.prompt;

  try {
    if (prompt == null) {
      throw new Error("Uh oh, no prompt was provided");
    }

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 64,
    });

    const completion = response.data.choices[0].text;

    // console.log(response)
    // return the result
    return res.status(200).json({
      success: true,
      message: completion,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred.",
    });
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}!!`));
