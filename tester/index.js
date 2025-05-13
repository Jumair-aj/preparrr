// server.js or routes/eval.js
import express from "express";
import { VM } from "vm2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run", (req, res) => {
  const { code, testCases } = req.body;

  try {
    for (const testCase of testCases) {
      const { input, output } = testCase;

      // Create a new VM instance for each test case
      const vm = new VM({
        timeout: 1000,
        sandbox: { input }
      });

      const wrappedCode = `
        const solve = ${code};
        solve(input);
      `;

      const result = vm.run(wrappedCode);
      if (result !== output) {
        return res.json({ success: false, message: "Output does not match the expected answer", result });
      }
    }
    // If all test cases pass, return success
    return res.json({ success: true, message: "All test cases passed" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.listen(4000, () => console.log("Sandbox running on http://localhost:4000"));
