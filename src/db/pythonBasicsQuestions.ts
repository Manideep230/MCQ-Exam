export interface RawQuestion {
  questionText: string;
  options: Record<string, string>;
  correctOption: string;
}

export const PYTHON_BASICS_QUESTIONS: RawQuestion[] = [
  // PART A — COMMENTS
  {
    questionText: `Consider the following Python code:\n\n# This program calculates the total\nprice = 100\nquantity = 3\ntotal = price * quantity\n\nWhat happens when this program runs?`,
    options: {
      A: "The first line is executed",
      B: "The first line is ignored by Python",
      C: "Python stores the comment in price",
      D: "Python produces a syntax error",
      E: "Python prints the comment",
      F: "Python treats the comment as a variable",
      G: "Python converts the comment into a string",
      H: "Python executes it after the last line"
    },
    correctOption: "B"
  },
  {
    questionText: `A developer wants to temporarily prevent one statement from executing without deleting it. Which is the most appropriate approach?`,
    options: {
      A: "Put # before the statement",
      B: "Put // before the statement",
      C: "Put /* before the statement",
      D: "Put -- before the statement",
      E: "Put ; before the statement",
      F: "Put : before the statement",
      G: "Put $ before the statement",
      H: "Put @ before the statement"
    },
    correctOption: "A"
  },
  {
    questionText: `Which statement about Python comments is correct?`,
    options: {
      A: "Comments are executed before the program",
      B: "Comments are ignored by the Python interpreter",
      C: "Comments must always contain a variable name",
      D: "Comments can only be written at the end of a program",
      E: "Comments are automatically printed",
      F: "Comments always occupy memory as Python variables",
      G: "Comments must contain valid Python expressions",
      H: "Comments change the datatype of the following variable"
    },
    correctOption: "B"
  },
  {
    questionText: `Consider the following code:\n\nx = 10  # student's initial score\ny = 20\n\nWhat is the purpose of the text after 10 on the first line?`,
    options: {
      A: "It changes the value of x",
      B: "It explains the statement and is ignored by Python",
      C: "It creates a second variable",
      D: "It performs addition",
      E: "It creates a string variable",
      F: "It causes the value of x to become a string",
      G: "It is stored in y",
      H: "It prevents y from executing"
    },
    correctOption: "B"
  },

  // PART B — INPUT
  {
    questionText: `Suppose a user enters:\n\n25\n\nwhen prompted using:\n\nage = input("Enter age: ")\n\nWhat type of value is stored in age?`,
    options: {
      A: "int",
      B: "float",
      C: "str",
      D: "bool",
      E: "list",
      F: "tuple",
      G: "complex",
      H: "NoneType"
    },
    correctOption: "C"
  },
  {
    questionText: `A programmer writes:\n\na = input("Enter a number: ")\nb = input("Enter another number: ")\nprint(a + b)\n\nIf the user enters 10 and 20, what is printed?`,
    options: {
      A: "30",
      B: "1020",
      C: "10 + 20",
      D: "20 + 10",
      E: "100200",
      F: "10.020.0",
      G: "An automatic conversion to integer occurs",
      H: "A TypeError occurs because input cannot be added"
    },
    correctOption: "B"
  },
  {
    questionText: `A programmer wants to calculate the sum of two numbers entered by a user. Which approach is appropriate?`,
    options: {
      A: "Convert both input values to integers before addition",
      B: "Convert both input values to comments",
      C: "Convert both values to Boolean values",
      D: "Use type() instead of conversion",
      E: "Use string slicing",
      F: "Use only input() and expect automatic arithmetic conversion",
      G: "Use print() before receiving input",
      H: "Use None as the input type"
    },
    correctOption: "A"
  },
  {
    questionText: `What happens if a user enters 12.5 and the program attempts to convert it using int("12.5")?`,
    options: {
      A: "It always becomes 12",
      B: "It becomes 12.5",
      C: "It raises a ValueError",
      D: "It raises a NameError",
      E: "It becomes True",
      F: "It becomes a string automatically",
      G: "It becomes None",
      H: "It raises a KeyError"
    },
    correctOption: "C"
  },
  {
    questionText: `Which statement best describes the result of Python's input() function?`,
    options: {
      A: "It always returns an integer",
      B: "It always returns a string",
      C: "It always returns a float",
      D: "It always returns a Boolean",
      E: "It returns a list",
      F: "It returns a tuple",
      G: "It returns a dictionary",
      H: "It returns a complex number"
    },
    correctOption: "B"
  },

  // PART C — DATA TYPES
  {
    questionText: `What is the datatype of the following value?\n\nx = 25`,
    options: {
      A: "str",
      B: "float",
      C: "int",
      D: "bool",
      E: "complex",
      F: "list",
      G: "tuple",
      H: "dict"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the datatype of the following value?\n\nx = 25.0`,
    options: {
      A: "int",
      B: "float",
      C: "str",
      D: "bool",
      E: "complex",
      F: "list",
      G: "tuple",
      H: "dict"
    },
    correctOption: "B"
  },
  {
    questionText: `Which variable contains a Boolean value?`,
    options: {
      A: 'x = "True"',
      B: "x = 1",
      C: "x = True",
      D: 'x = "False"',
      E: "x = 0.0",
      F: 'x = "1"',
      G: "x = None",
      H: 'x = "boolean"'
    },
    correctOption: "C"
  },
  {
    questionText: `Consider:\n\nx = 3 + 4j\n\nWhich datatype does x have?`,
    options: {
      A: "int",
      B: "float",
      C: "str",
      D: "bool",
      E: "complex",
      F: "tuple",
      G: "list",
      H: "dict"
    },
    correctOption: "E"
  },
  {
    questionText: `Which option contains values belonging to different Python datatypes?`,
    options: {
      A: "10, 20, 30",
      B: '"10", "20", "30"',
      C: "True, False",
      D: '10, 5.5, "Python"',
      E: "1.0, 2.0, 3.0",
      F: '"A", "B", "C"',
      G: "True, True, False",
      H: "2+3j, 4+5j"
    },
    correctOption: "D"
  },
  {
    questionText: `Consider:\n\nx = 10\nx = "Python"\n\nWhat is true about x after the second statement?`,
    options: {
      A: "It remains an integer",
      B: 'It refers to the string value "Python"',
      C: "Python produces a datatype error",
      D: "It becomes a Boolean",
      E: "It becomes a float",
      F: "Both values are permanently stored in x",
      G: "It becomes None",
      H: "Python does not allow reassignment"
    },
    correctOption: "B"
  },
  {
    questionText: `Which statement best describes Python's typing system?`,
    options: {
      A: "A variable can only have one datatype throughout the program",
      B: "Python variables can refer to values of different datatypes at different times",
      C: "Every variable must be declared using its datatype",
      D: "Python supports only numeric datatypes",
      E: "Python converts every value to a string",
      F: "Python variables cannot be reassigned",
      G: "Python requires int, str, or float declarations before assignment",
      H: "Python has no datatypes"
    },
    correctOption: "B"
  },
  {
    questionText: `Which of the following is a floating-point value?`,
    options: {
      A: "100",
      B: '"100"',
      C: "100.5",
      D: "True",
      E: "100j",
      F: "None",
      G: '"100.5"',
      H: "False"
    },
    correctOption: "C"
  },
  {
    questionText: `Which option represents a string rather than a number?`,
    options: {
      A: "45",
      B: "45.0",
      C: "45j",
      D: '"45"',
      E: "True",
      F: "False",
      G: "None",
      H: "0"
    },
    correctOption: "D"
  },

  // PART D — ARITHMETIC OPERATORS
  {
    questionText: `What is the result?\n\nx = 15\ny = 4\nprint(x + y)`,
    options: {
      A: "9",
      B: "11",
      C: "19",
      D: "60",
      E: "3",
      F: "3.75",
      G: "16",
      H: "20"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the result?\n\nx = 15\ny = 4\nprint(x - y)`,
    options: {
      A: "11",
      B: "19",
      C: "60",
      D: "3",
      E: "3.75",
      F: "4",
      G: "10",
      H: "1"
    },
    correctOption: "A"
  },
  {
    questionText: `What is the result?\n\nprint(7 * 6)`,
    options: {
      A: "13",
      B: "1",
      C: "42",
      D: "36",
      E: "76",
      F: "0",
      G: "49",
      H: "7.6"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the result?\n\nprint(20 / 5)`,
    options: {
      A: "4",
      B: "4.0",
      C: "5",
      D: "15",
      E: "25",
      F: "0",
      G: "4.5",
      H: "20.5"
    },
    correctOption: "B"
  },
  {
    questionText: `What is the result?\n\nprint(17 // 5)`,
    options: {
      A: "2",
      B: "3",
      C: "3.4",
      D: "4",
      E: "5",
      F: "12",
      G: "15",
      H: "17"
    },
    correctOption: "B"
  },
  {
    questionText: `What is the result?\n\nprint(17 % 5)`,
    options: {
      A: "0",
      B: "1",
      C: "2",
      D: "3",
      E: "3.4",
      F: "5",
      G: "12",
      H: "17"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the result?\n\nprint(2 ** 4)`,
    options: {
      A: "6",
      B: "8",
      C: "12",
      D: "16",
      E: "24",
      F: "4",
      G: "32",
      H: "14"
    },
    correctOption: "D"
  },

  // PART E — COMPARISON OPERATORS
  {
    questionText: `What is the result?\n\nprint(10 > 7)`,
    options: {
      A: "True",
      B: "False",
      C: "10",
      D: "7",
      E: "3",
      F: '"True"',
      G: '"False"',
      H: "None"
    },
    correctOption: "A"
  },
  {
    questionText: `What is the result?\n\nprint(8 == 8)`,
    options: {
      A: "8",
      B: "False",
      C: "True",
      D: "1",
      E: "0",
      F: '"8"',
      G: "None",
      H: "Error"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the result?\n\nprint(12 != 12)`,
    options: {
      A: "True",
      B: "False",
      C: "12",
      D: "0",
      E: "1",
      F: '"False"',
      G: "None",
      H: "12 != 12"
    },
    correctOption: "B"
  },
  {
    questionText: `A program checks:\n\nage = 18\nage >= 18\n\nWhat is the result?`,
    options: {
      A: "True",
      B: "False",
      C: "18",
      D: "0",
      E: "1",
      F: '"18"',
      G: "None",
      H: "Error"
    },
    correctOption: "A"
  },
  {
    questionText: `Which expression evaluates to False?`,
    options: {
      A: "5 < 10",
      B: "10 == 10",
      C: "15 > 3",
      D: "8 != 2",
      E: "7 >= 7",
      F: "4 > 20",
      G: "9 <= 10",
      H: "3 == 3"
    },
    correctOption: "F"
  },

  // PART F — LOGICAL OPERATORS
  {
    questionText: `What is the result?\n\nprint(True and True)`,
    options: {
      A: "True",
      B: "False",
      C: "1",
      D: "0",
      E: "None",
      F: '"True"',
      G: '"False"',
      H: "Error"
    },
    correctOption: "A"
  },
  {
    questionText: `What is the result?\n\nprint(True and False)`,
    options: {
      A: "True",
      B: "False",
      C: "1",
      D: "0",
      E: "None",
      F: '"True"',
      G: '"False"',
      H: "Error"
    },
    correctOption: "B"
  },
  {
    questionText: `What is the result?\n\nprint(True or False)`,
    options: {
      A: "True",
      B: "False",
      C: "0",
      D: "1",
      E: "None",
      F: '"True"',
      G: '"False"',
      H: "Error"
    },
    correctOption: "A"
  },
  {
    questionText: `What is the result?\n\nprint(not True)`,
    options: {
      A: "True",
      B: "False",
      C: "1",
      D: "0",
      E: "None",
      F: '"True"',
      G: '"False"',
      H: "Error"
    },
    correctOption: "B"
  },
  {
    questionText: `A student can enter an examination only if both conditions are satisfied:\n\nattendance >= 75\nfee_paid == True\n\nWhich logical operator best represents this requirement?`,
    options: {
      A: "and",
      B: "or",
      C: "not",
      D: "==",
      E: "!=",
      F: ">",
      G: "%",
      H: "**"
    },
    correctOption: "A"
  },
  {
    questionText: `A login system allows access when either a valid fingerprint OR a valid password is provided. Which logical operator best represents this requirement?`,
    options: {
      A: "and",
      B: "or",
      C: "not",
      D: "==",
      E: "!=",
      F: "/",
      G: "%",
      H: "**"
    },
    correctOption: "B"
  },

  // PART G — ASSIGNMENT OPERATORS
  {
    questionText: `Consider:\n\nx = 10\nx += 5\n\nWhat is the final value of x?`,
    options: {
      A: "5",
      B: "10",
      C: "15",
      D: "50",
      E: "105",
      F: "-5",
      G: "2",
      H: "0"
    },
    correctOption: "C"
  },
  {
    questionText: `Consider:\n\nx = 20\nx -= 8\n\nWhat is the final value of x?`,
    options: {
      A: "28",
      B: "12",
      C: "8",
      D: "160",
      E: "20",
      F: "-12",
      G: "2.5",
      H: "0"
    },
    correctOption: "B"
  },
  {
    questionText: `Consider:\n\nx = 6\nx *= 4\n\nWhat is the final value of x?`,
    options: {
      A: "10",
      B: "2",
      C: "24",
      D: "1.5",
      E: "64",
      F: "20",
      G: "4",
      H: "0"
    },
    correctOption: "C"
  },
  {
    questionText: `Consider:\n\nx = 20\nx /= 4\n\nWhat is the value and datatype of x?`,
    options: {
      A: "5, integer",
      B: "5.0, float",
      C: "4, integer",
      D: "4.0, float",
      E: "80, integer",
      F: "0, integer",
      G: '"5", string',
      H: "True, Boolean"
    },
    correctOption: "B"
  },
  {
    questionText: `Consider:\n\nx = 17\nx //= 5\n\nWhat is the final value of x?`,
    options: {
      A: "2",
      B: "3",
      C: "3.4",
      D: "4",
      E: "5",
      F: "12",
      G: "17",
      H: "0"
    },
    correctOption: "B"
  },
  {
    questionText: `Consider:\n\nx = 17\nx %= 5\n\nWhat is the final value of x?`,
    options: {
      A: "1",
      B: "2",
      C: "3",
      D: "3.4",
      E: "5",
      F: "12",
      G: "17",
      H: "0"
    },
    correctOption: "C"
  },

  // PART H — OPERATOR PRECEDENCE
  {
    questionText: `What is the result?\n\nresult = 5 + 3 * 2`,
    options: {
      A: "16",
      B: "11",
      C: "10",
      D: "13",
      E: "8",
      F: "6",
      G: "12",
      H: "5"
    },
    correctOption: "B"
  },
  {
    questionText: `What is the result?\n\nresult = (5 + 3) * 2`,
    options: {
      A: "11",
      B: "13",
      C: "16",
      D: "10",
      E: "8",
      F: "6",
      G: "15",
      H: "12"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the result?\n\nresult = 20 - 4 * 3`,
    options: {
      A: "48",
      B: "8",
      C: "12",
      D: "16",
      E: "20",
      F: "4",
      G: "32",
      H: "60"
    },
    correctOption: "B"
  },
  {
    questionText: `What is the result?\n\nresult = 20 / 5 + 2`,
    options: {
      A: "2.8",
      B: "6.0",
      C: "4.4",
      D: "10",
      E: "5",
      F: "8",
      G: "2",
      H: "6"
    },
    correctOption: "B"
  },
  {
    questionText: `What is the result?\n\nresult = 2 + 3 * 4 ** 2`,
    options: {
      A: "50",
      B: "26",
      C: "38",
      D: "80",
      E: "44",
      F: "144",
      G: "20",
      H: "48"
    },
    correctOption: "A"
  },
  {
    questionText: `What is the result?\n\nresult = 10 > 5 and 3 < 8`,
    options: {
      A: "True",
      B: "False",
      C: "10",
      D: "5",
      E: "3",
      F: "8",
      G: "1",
      H: "Error"
    },
    correctOption: "A"
  },
  {
    questionText: `Which expression demonstrates the effect of parentheses overriding normal arithmetic precedence?`,
    options: {
      A: "2 + 3 * 4",
      B: "10 / 2 + 5",
      C: "(2 + 3) * 4",
      D: "10 - 3 * 2",
      E: "5 ** 2 + 1",
      F: "8 / 4 - 1",
      G: "7 + 2 * 3",
      H: "9 % 4 + 2"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the result?\n\nx = 4\nresult = x + 2 > 5`,
    options: {
      A: "True",
      B: "False",
      C: "6",
      D: "5",
      E: "4",
      F: "2",
      G: '"True"',
      H: "Error"
    },
    correctOption: "A"
  },

  // PART I — type()
  {
    questionText: `What is displayed?\n\nx = 25\nprint(type(x))`,
    options: {
      A: "<class 'str'>",
      B: "<class 'float'>",
      C: "<class 'int'>",
      D: "<class 'bool'>",
      E: "<class 'complex'>",
      F: "25",
      G: '"int"',
      H: "Integer"
    },
    correctOption: "C"
  },
  {
    questionText: `What is displayed?\n\nx = "25"\nprint(type(x))`,
    options: {
      A: "<class 'int'>",
      B: "<class 'str'>",
      C: "<class 'float'>",
      D: "<class 'bool'>",
      E: "<class 'complex'>",
      F: "25",
      G: '"25"',
      H: "StringType"
    },
    correctOption: "B"
  },
  {
    questionText: `Consider:\n\nx = 10\ny = 10.0\n\nWhich statement is correct?`,
    options: {
      A: "Both variables have the same datatype",
      B: "x is int and y is float",
      C: "x is float and y is int",
      D: "Both are strings",
      E: "Both are Booleans",
      F: "x is complex and y is float",
      G: "x is string and y is float",
      H: "Python cannot distinguish them"
    },
    correctOption: "B"
  },
  {
    questionText: `A programmer wants to determine the datatype of a value stored in variable data. Which built-in function should be used?`,
    options: {
      A: "input()",
      B: "print()",
      C: "type()",
      D: "datatype()",
      E: "typeof()",
      F: "checktype()",
      G: "value()",
      H: "classof()"
    },
    correctOption: "C"
  },
  {
    questionText: `Consider:\n\nx = True\nprint(type(x))\n\nWhat datatype will Python report?`,
    options: {
      A: "int",
      B: "str",
      C: "float",
      D: "bool",
      E: "complex",
      F: "NoneType",
      G: "BooleanType",
      H: "logical"
    },
    correctOption: "D"
  },

  // PART J — STRINGS
  {
    questionText: `Which statement correctly creates a single-line string?`,
    options: {
      A: 'name = "Python"',
      B: "name = Python",
      C: "name = <Python>",
      D: "name = /Python/",
      E: "name = Python()",
      F: "name = #Python",
      G: "name = Python[]",
      H: "name = {Python}"
    },
    correctOption: "A"
  },
  {
    questionText: `What is the value stored in message?\n\nmessage = 'Hello Python'`,
    options: {
      A: "A number",
      B: "A Boolean",
      C: "A single-line string",
      D: "A list",
      E: "A tuple",
      F: "A dictionary",
      G: "A function",
      H: "A comment"
    },
    correctOption: "C"
  },
  {
    questionText: `Which option correctly represents a multiline string in Python?`,
    options: {
      A: "A string enclosed using triple quotes",
      B: "A string beginning with //",
      C: "A string beginning with #",
      D: "A string enclosed only in square brackets",
      E: "A string enclosed only in curly braces",
      F: "A string beginning with --",
      G: "A string beginning with @@",
      H: "A string without quotation marks"
    },
    correctOption: "A"
  },
  {
    questionText: `Consider:\n\ntext = """Python\nis\neasy"""\n\nHow many lines of text are contained in the string?`,
    options: {
      A: "1",
      B: "2",
      C: "3",
      D: "4",
      E: "5",
      F: "6",
      G: "0",
      H: "It produces an error"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the datatype of the following value?\n\ntext = """Hello\nWorld"""`,
    options: {
      A: "list",
      B: "tuple",
      C: "dict",
      D: "str",
      E: "bool",
      F: "int",
      G: "float",
      H: "NoneType"
    },
    correctOption: "D"
  },
  {
    questionText: `Consider:\n\nname = "Python"\n\nWhich statement is true?`,
    options: {
      A: "Strings can contain only numbers",
      B: "name stores a string value",
      C: "name becomes a Boolean",
      D: "Python automatically converts it to a list",
      E: "The quotation marks become separate characters in the string",
      F: "The variable cannot be reassigned",
      G: "The string must contain multiple lines",
      H: "The string is treated as a comment"
    },
    correctOption: "B"
  },
  {
    questionText: `What is the result?\n\na = "Hello"\nb = "World"\nprint(a + " " + b)`,
    options: {
      A: "HelloWorld",
      B: "Hello World",
      C: "Hello+World",
      D: "Hello  World",
      E: "World Hello",
      F: "HelloWorld only",
      G: "An integer is produced",
      H: "A TypeError occurs"
    },
    correctOption: "B"
  },
  {
    questionText: `What happens when the following code runs?\n\ntext = "Python"\nprint(text[0])`,
    options: {
      A: "P",
      B: "y",
      C: "n",
      D: "Python",
      E: "0",
      F: "1",
      G: "An empty string",
      H: "IndexError"
    },
    correctOption: "A"
  },
  {
    questionText: `What is the result?\n\ntext = "Python"\nprint(len(text))`,
    options: {
      A: "5",
      B: "6",
      C: "7",
      D: "0",
      E: "1",
      F: '"6"',
      G: "None",
      H: "Error"
    },
    correctOption: "B"
  },
  {
    questionText: `Which statement is correct about Python strings?`,
    options: {
      A: "Strings are mutable",
      B: "Individual characters can always be changed directly",
      C: "Strings are immutable",
      D: "Strings cannot be indexed",
      E: "Strings cannot be sliced",
      F: "Strings can only contain letters",
      G: "Strings cannot contain spaces",
      H: "Strings can contain only ASCII characters"
    },
    correctOption: "C"
  },

  // PART K — STRING SLICING
  {
    questionText: `Consider:\n\ntext = "Python"\nprint(text[0:2])`,
    options: {
      A: "P",
      B: "Py",
      C: "Pyt",
      D: "Python",
      E: "yt",
      F: "tho",
      G: "on",
      H: "y"
    },
    correctOption: "B"
  },
  {
    questionText: `What is the result?\n\ntext = "Python"\nprint(text[1:4])`,
    options: {
      A: "Pyt",
      B: "yth",
      C: "tho",
      D: "ython",
      E: "yt",
      F: "hon",
      G: "Python",
      H: "y"
    },
    correctOption: "B"
  },
  {
    questionText: `What is the result?\n\ntext = "Computer"\nprint(text[0:4])`,
    options: {
      A: "Comp",
      B: "Compu",
      C: "ompu",
      D: "pute",
      E: "Computer",
      F: "Com",
      G: "uter",
      H: "C"
    },
    correctOption: "A"
  },
  {
    questionText: `Consider:\n\ntext = "Cybersecurity"\nprint(text[4:8])\n\nWhat is returned?`,
    options: {
      A: "Cybe",
      B: "yber",
      C: "bers",
      D: "erse",
      E: "secu",
      F: "ecur",
      G: "urity",
      H: "security"
    },
    correctOption: "E"
  },
  {
    questionText: `What is the result?\n\ntext = "Python"\nprint(text[:3])`,
    options: {
      A: "P",
      B: "Py",
      C: "Pyt",
      D: "yth",
      E: "Python",
      F: "hon",
      G: "y",
      H: "Empty string"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the result?\n\ntext = "Python"\nprint(text[3:])`,
    options: {
      A: "Pyt",
      B: "yth",
      C: "hon",
      D: "on",
      E: "Python",
      F: "tho",
      G: "y",
      H: "Empty string"
    },
    correctOption: "C"
  },
  {
    questionText: `Consider:\n\ntext = "Programming"\nprint(text[3:7])\n\nWhich output is correct?`,
    options: {
      A: "Pro",
      B: "Prog",
      C: "gram",
      D: "gramm",
      E: "ming",
      F: "ogra",
      G: "ramm",
      H: "Programming"
    },
    correctOption: "C"
  },
  {
    questionText: `What is the result?\n\ntext = "Database"\nprint(text[2:6])`,
    options: {
      A: "Data",
      B: "Database",
      C: "taba",
      D: "atab",
      E: "abase",
      F: "base",
      G: "atab",
      H: "ata"
    },
    correctOption: "C"
  },
  {
    questionText: `What does the expression below return?\n\ntext = "Python"\ntext[1:5]`,
    options: {
      A: "Characters from index 1 through 5, including index 5",
      B: "Characters from index 1 up to but not including index 5",
      C: "Characters from index 0 through 5",
      D: "Only the character at index 1",
      E: "Only the character at index 5",
      F: "The complete string",
      G: "An integer representing the length",
      H: "A Boolean value"
    },
    correctOption: "B"
  },
  {
    questionText: `A developer wants the first five characters of "Security". Which expression is appropriate?`,
    options: {
      A: "text[0:5]",
      B: "text[1:5]",
      C: "text[0:4]",
      D: "text[5:0]",
      E: "text[1:6]",
      F: "text[5:]",
      G: "text[:4]",
      H: "text[2:5]"
    },
    correctOption: "A"
  },

  // PART L — EXCEPTIONS AND ERRORS
  {
    questionText: `What happens when the following code runs?\n\nx = 10\ny = 0\nprint(x / y)`,
    options: {
      A: "It prints 0",
      B: "It prints 10",
      C: "It raises ZeroDivisionError",
      D: "It raises ValueError",
      E: "It raises NameError",
      F: "It raises IndexError",
      G: "It raises KeyError",
      H: "It automatically returns None"
    },
    correctOption: "C"
  },
  {
    questionText: `A calculator application allows users to enter two numbers. The user enters 100 and 0 as the divisor. Which problem must the programmer handle?`,
    options: {
      A: "NameError",
      B: "IndexError",
      C: "ZeroDivisionError",
      D: "KeyError",
      E: "AttributeError",
      F: "ImportError",
      G: "OverflowError",
      H: "SyntaxError"
    },
    correctOption: "C"
  },
  {
    questionText: `What happens here?\n\nage = int("twenty")`,
    options: {
      A: "age becomes 20",
      B: 'age becomes "twenty"',
      C: "ValueError occurs",
      D: "TypeError occurs",
      E: "NameError occurs",
      F: "IndexError occurs",
      G: "KeyError occurs",
      H: "OverflowError occurs"
    },
    correctOption: "C"
  },
  {
    questionText: `A program expects the user to enter a number but receives:\n\nabc\n\nand tries to convert it to an integer. Which exception is most likely?`,
    options: {
      A: "ValueError",
      B: "NameError",
      C: "KeyError",
      D: "IndexError",
      E: "AttributeError",
      F: "ImportError",
      G: "ZeroDivisionError",
      H: "RecursionError"
    },
    correctOption: "A"
  },
  {
    questionText: `What happens?\n\nprint(username)\n\nwhen no variable named username has been defined?`,
    options: {
      A: "It prints an empty string",
      B: "It prints None",
      C: "It raises NameError",
      D: "It raises ValueError",
      E: "It raises IndexError",
      F: "It creates username automatically",
      G: 'It prints "username"',
      H: "It raises KeyError"
    },
    correctOption: "C"
  },
  {
    questionText: `Consider:\n\ntotal = price + tax\n\nIf tax has never been defined, which exception is expected?`,
    options: {
      A: "ValueError",
      B: "NameError",
      C: "IndexError",
      D: "KeyError",
      E: "AttributeError",
      F: "ImportError",
      G: "OverflowError",
      H: "ZeroDivisionError"
    },
    correctOption: "B"
  },
  {
    questionText: `Consider:\n\nnumbers = [10, 20, 30]\nprint(numbers[5])\n\nWhat happens?`,
    options: {
      A: "10 is printed",
      B: "20 is printed",
      C: "30 is printed",
      D: "0 is printed",
      E: "IndexError occurs",
      F: "KeyError occurs",
      G: "ValueError occurs",
      H: "NameError occurs"
    },
    correctOption: "E"
  },
  {
    questionText: `A list contains 5 elements. A programmer tries to access the element at index 5. What is the likely result?`,
    options: {
      A: "The first element is returned",
      B: "The last element is returned",
      C: "IndexError occurs",
      D: "KeyError occurs",
      E: "ValueError occurs",
      F: "The list automatically expands",
      G: "None is returned",
      H: "A new element is created"
    },
    correctOption: "C"
  },
  {
    questionText: `Consider:\n\nstudent = {\n    "name": "Ravi",\n    "age": 20\n}\n\nprint(student["branch"])\n\nWhat happens?`,
    options: {
      A: '"branch" is printed',
      B: "None is printed",
      C: "KeyError occurs",
      D: "IndexError occurs",
      E: "ValueError occurs",
      F: "NameError occurs",
      G: '"CSE" is automatically created',
      H: "The dictionary is deleted"
    },
    correctOption: "C"
  },
  {
    questionText: `A dictionary contains keys name, age, and branch. A program attempts to access a key named marks that does not exist. Which exception should be handled?`,
    options: {
      A: "IndexError",
      B: "KeyError",
      C: "NameError",
      D: "ValueError",
      E: "AttributeError",
      F: "ImportError",
      G: "OverflowError",
      H: "ZeroDivisionError"
    },
    correctOption: "B"
  },
  {
    questionText: `Consider:\n\nname = "Python"\nprint(name.append("3"))\n\nWhat type of problem occurs?`,
    options: {
      A: "KeyError",
      B: "IndexError",
      C: "AttributeError",
      D: "NameError",
      E: "ValueError",
      F: "ImportError",
      G: "ZeroDivisionError",
      H: "OverflowError"
    },
    correctOption: "C"
  },
  {
    questionText: `A programmer tries to use a list-only method on an integer object. What type of exception can occur because the object does not have that attribute?`,
    options: {
      A: "ValueError",
      B: "AttributeError",
      C: "KeyError",
      D: "IndexError",
      E: "NameError",
      F: "ImportError",
      G: "OverflowError",
      H: "ZeroDivisionError"
    },
    correctOption: "B"
  },
  {
    questionText: `A Python program attempts to import a specific item from a module, but that item does not exist in the module. Which exception is commonly associated with this situation?`,
    options: {
      A: "ImportError",
      B: "IndexError",
      C: "KeyError",
      D: "ValueError",
      E: "NameError",
      F: "AttributeError",
      G: "ZeroDivisionError",
      H: "RecursionError"
    },
    correctOption: "A"
  },
  {
    questionText: `A programmer writes code that imports a module component that cannot be found in the installed module. What should the programmer investigate first?`,
    options: {
      A: "Whether the requested module component actually exists",
      B: "Whether the list index is valid",
      C: "Whether division by zero occurred",
      D: "Whether a dictionary key exists",
      E: "Whether a string is sliced correctly",
      F: "Whether a variable is a Boolean",
      G: "Whether an integer is negative",
      H: "Whether comments are present"
    },
    correctOption: "A"
  },
  {
    questionText: `Consider two situations:\n\nSituation 1:\nA program attempts to perform a calculation that results in a numeric overflow.\n\nSituation 2:\nA function repeatedly calls itself without reaching a stopping condition.\n\nWhich pair of exceptions is most relevant to these situations respectively?`,
    options: {
      A: "OverflowError and RecursionError",
      B: "ValueError and KeyError",
      C: "IndexError and NameError",
      D: "ImportError and AttributeError",
      E: "ZeroDivisionError and ValueError",
      F: "KeyError and OverflowError",
      G: "NameError and IndexError",
      H: "AttributeError and ImportError"
    },
    correctOption: "A"
  }
];
