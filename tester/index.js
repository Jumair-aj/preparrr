// server.js or routes/eval.js
import express from "express";
import { VM } from "vm2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run", (req, res) => {
  const { code, input, answer } = req.body;

  try {
    const vm = new VM({
      timeout: 1000,
      sandbox: { input }
    });

    const wrappedCode = `
      const solve = ${code};
      solve(input);
    `;

    const output = vm.run(wrappedCode);
    if (output == answer) {
      return res.json({ success: true, output, message: "Output matches the expected answer" });
    }
    else {
      return res.json({ success: false, message: "Output does not match the expected answer", output });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.listen(4000, () => console.log("Sandbox running on http://localhost:4000"));
