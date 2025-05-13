export interface Question {
  title: string
  description: string
  example: string
  testCases: { input: string | number | number[]; output: string | number | number[] }[]
}

export const questions: Question[] = [
  {
    title: "Reverse a String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters. You must do this by modifying the input array in-place with O(1) extra memory. Try to solve this without using built-in methods for an extra challenge.Write a function that reverses a string. The input string is given as an array of characters. You must do this by modifying the input array in-place with O(1) extra memory. Try to solve this without using built-in methods for an extra challenge.",
    example:
      "Input: 'hello'\nOutput: 'olleh'\n\nExample 2:\nInput: 'CodeMaster'\nOutput: 'retsaMedoC'\n\nExplanation: Reverse the characters in the string.",
    testCases: [{ input: "hello", output: "olleh" }, { input: "CodeMaster", output: "retsaMedoC" }]
  },
  {
    title: "Sum of Array",
    description:
      "Write a function that returns the sum of all numbers in an array. The array may contain both positive and negative integers. Consider edge cases like empty arrays or arrays with non-numeric values.",
    example:
      "Input: [1, 2, 3, 4]\nOutput: 10\n\nExample 2:\nInput: [-1, -2, 10, 5]\nOutput: 12\n\nExplanation: Sum all elements in the array.",
    testCases: [
      { input: [1, 2, 3, 4], output: 10 },
      { input: [-1, -2, 10, 5], output: 12 }
    ]
  },
  {
    title: "Factorial",
    description:
      "Write a function to calculate the factorial of a non-negative integer n. Factorial is the product of all positive integers less than or equal to n. Consider implementing both an iterative and a recursive solution, and think about which might be more efficient for large inputs.",
    example:
      "Input: 5\nOutput: 120\n\nExample 2:\nInput: 0\nOutput: 1\n\nExplanation: 5! = 5 × 4 × 3 × 2 × 1 = 120, and 0! = 1 by definition.",
    testCases: [{ input: 5, output: 120 }, { input: 0, output: 1 }]
  },
]
