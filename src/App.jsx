import { useState } from 'react'
// import viteLogo from '/vite.svg'
import './App.css'

import {useEffect} from 'react';

import { Client } from "@gradio/client";

const delay = ms => new Promise(
  resolve => setTimeout(resolve, ms)
);


const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

function CollegePrep() {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    gender: 'man',
    grade: '8th',
    lowIncome: false,
    pursuing: ''
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const prompt = `What should a ${formData.lowIncome ? 'low income' : ''} ${formData.grade} student who identifies as a ${formData.gender} in ${formData.city}, ${formData.state} do over the next school year and upcoming summer if they are interested in pursuing ${formData.pursuing}? List each activity with the Activity: Activity Name and Description: Full Description. Do not list general activities. I want you to list all the available specific programs that are available to them nationwide, online, in the state or nearby. Please make your recommendations so they can be a well rounded, competitive student that is able to receive scholarships and emphasizes volunteering.`;

    try {
      const response = await axios.post('https://api.perplexity.ai/chat/completions', {
        model: 'llama-3-sonar-large-32k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an artificial intelligence assistant and you need to engage in a helpful, detailed, polite conversation with a user.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'Authorization': 'Bearer pplx-519d06d900dda463e2316dd905a98558f4f14418a692230c_',
          'Content-Type': 'application/json'
        }
      });

      const parsedActivities = parseActivities(response.data.choices[0].message.content);
      setActivities(parsedActivities);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching opportunities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const parseActivities = (content) => {
    const activityRegex = /Activity: (.*?)\nDescription: ([\s\S]*?)(?=\n\nActivity:|$)/g;
    const activities = [];
    let match;

    while ((match = activityRegex.exec(content)) !== null) {
      activities.push({
        name: match[1].trim(),
        description: match[2].trim(),
        favorite: false
      });
    }

    return activities;
  };

  const toggleFavorite = (index) => {
    setActivities(prevActivities => 
      prevActivities.map((activity, i) => 
        i === index ? { ...activity, favorite: !activity.favorite } : activity
      )
    );
  };

  return (
    <div id = "home">
      <div className="App">
        <h1>Student Opportunity Finder</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="City"
            required
          />
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a state</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="man">Man</option>
            <option value="woman">Woman</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            required
          >
            {['8th', '9th', '10th', '11th', '12th'].map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          <label>
            <input
              type="checkbox"
              name="lowIncome"
              checked={formData.lowIncome}
              onChange={handleInputChange}
            />
            Low-income
          </label>
          <input
            type="text"
            name="pursuing"
            value={formData.pursuing}
            onChange={handleInputChange}
            placeholder="What are you interested in pursuing?"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Finding Opportunities...' : 'Find Opportunities'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="results">
          {activities.map((activity, index) => (
            <div key={index} className="activity-box">
              <h3>{activity.name}</h3>
              <p>{activity.description}</p>
              <span 
                className={`star ${activity.favorite ? 'favorite' : ''}`}
                onClick={() => toggleFavorite(index)}
              >
                {activity.favorite ? '★' : '☆'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [selected, setSelected] = useState("Home")
  const [logged, setLogged] = useState(0)
  const [newLesson, setNewLesson] = useState("")


  if (logged === 2) {
    return (
      <>
        <Navbar profile = {true} setSelected={setSelected}/>
        <Sidebar selected = { selected } setSelected = { setSelected } />
        { selected === "Home" ? 
          <Home selected = { selected } setSelected = { setSelected } /> 
        : selected === "CS61A Functions" ? 
          <Lesson icon = { "undraw_code.svg" } name = { "CS61A Functions" } details = { ["Defining a Function", "Variable Scopes", "Return Values", "Parameters", "Input Types", "Recursion"] }/> 
        : selected === "New Lesson" ?
          <NewLesson setNewLesson = { setNewLesson } />
        : selected === "college" ?
          <CollegePrep/>
        : selected === "search" ?
          <Search />
        :
          <Lesson icon = { "undraw_chat-text.svg" } name = { "中国的菜" } details = { ["饺子", "米饭", "火锅", "服务眼", "不好意思"] }/> 
        }




          {/* <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button> */}

          <button id = "add" onClick = {() => setSelected("New Lesson")}>
            <img src = "undraw_x-mark.svg"></img>
          </button>

      </>
    )
  } else if (logged === 1) {
    return (
      <>
        <Navbar profile = {false} setSelected={setSelected}/>
        <div style = {{ display: "flex", width: "100%", justifyContent: "center"}}>
          <div style = {{ width: "20rem", color: "black", textAlign: "center", paddingLeft: "2rem", paddingRight: "2rem", height: "25rem", marginTop: "10rem", justifyContent: "center", display: "flex", flexDirection: "column", backgroundColor: "rgb(199, 199, 199)", borderRadius: "2rem"}}>
            <p> Email </p>
            <input style = {{ margin: "1rem", color: "black", padding: "1rem", backgroundColor: "white"}} type="text" id="fname" name="fname"/>
            <p> Password </p>
            <input type = "password" style = {{ margin: "1rem", color: "black", padding: "1rem", backgroundColor: "white"}} id="lname" name="lname"/>
            <br/>
            <button style = {{ padding: "1rem", borderRadius: "2rem", backgroundColor: "purple", fontSize: "2rem"}} onClick = {() => setTimeout(() => {setLogged(2)}, 2000)}>
              <p>Sign In</p>
            </button>
          </div>
        </div>
      </>
    )
  } else {
    return (
      <>
        <Navbar profile = {false} setSelected={setSelected}/>
        <div style = {{ display: "flex", padding: "4rem"}}>
          <div style = {{ width: "50%", fontSize: "2.5rem"}}>
            <h1>The future doesn't have to be bleak.</h1>
            <br></br>
            <h1>Elevate your learning with AnyLesson.</h1>
          </div>
          <div style = {{ width: "50%"}}>
            <img src = "undraw_learning.svg" style = {{ width: "40rem", height: "20rem"}}></img>
          </div>
        </div>
        <div style = {{ display: "flex", padding: "2rem"}}>
          <p style = {{ marginRight: "1rem"}}>Our platform is more than a tutor; it's a mentor and educator rolled into one. We offered personalized learning experiences that adapt to your needs, helping you excel in your studies and beyond.</p>
          <p style = {{ marginLeft: "1rem"}}>AnyLesson empowers students from underserved backgrounds with AI-driven digital learning. With less than 30% of low-income students enrolling in college and even few graduating, we're here to change that.</p>
        </div>
        <div style = {{ display: "flex", justifyContent: "center", padding: "4rem", paddingBottom: "6rem"}}>
          <button style = {{ textAlign: "center", color: "white", padding: "2rem", backgroundColor: "purple", borderRadius: "2rem"}} onClick = {() => setTimeout(() => {setLogged(1)}, 1000)}>
            <h1>
              Begin the Journey
            </h1>
          </button>
        </div>
        <div style = {{ backgroundColor: "#C49E85", padding: "4rem", color:"white"}}>
            <div style = {{ display: "flex", justifyContent: "space-between" }}>
                <h1>AnyLesson.ai</h1>
                <div style = {{ textAlign: "right", lineHeight: "3rem", marginBottom: "4rem;" }}>
                    <p>Our Team</p>
                    <p>Technology</p>
                    <p>Careers</p>
                    <p>News and Insight</p>
                </div>
            </div>
            <br/>
            <hr style = {{ borderColor: "white" }}/>
            <p style = {{ marginTop: "2rem", marginBottom: "3rem" }}>Privacy | Terms of Usage | Notices | Disclosures</p>
            <hr style = {{ borderColor: "white" }}/>
        </div>
      </>
    )
  }
}

function Navbar({ profile, setSelected })  {
  if (profile) {
    return (
      <nav>
          <div id = "logo">
            <h1>AnyLesson.ai</h1>
            <img src = "undraw_rocket.svg"></img>
          </div>
          <a>
            <img src = "undraw_profile.svg"></img>
          </a>
          <a>Support</a>
          <a>Contact</a>
          <button style = {{color:"black", fontSize: "1rem", marginRight: "2rem"}} onClick = {() => setSelected("college")}>College Prep</button>
      </nav>
    )
  } else {
    return (
      <nav>
          <div id = "logo">
            <h1>AnyLesson.ai</h1>
            <img src = "undraw_rocket.svg"></img>
          </div>
          <a>Support</a>
          <a>Contact</a>
          <button style = {{color:"black", fontSize: "1rem", marginRight: "2rem"}} onClick = {() => setSelected("college")}>College Prep</button>
      </nav>
    )
  }
}

function Home({ selected, setSelected }) {
  return (
    <div id = "home">
      <HomeCard icon = { "undraw_code.svg" } name = { "CS61A Functions" } details = { ["Defining a Function", "Variable Scopes", "Return Values"] } selected = { selected } setSelected = {setSelected} />
      <HomeCard icon = { "undraw_chat-text.svg" } name = { "中国的菜" } details = { ["饺子", "米饭", "火锅"] } selected = { selected } setSelected = {setSelected} />
    </div>
  )
}

function Search({ selected, setSelected }) {
  return (
    <div id = "home">
      <SearchCard name = { "CS61B Functions" } details = { "Sameem: Helped me with everything to pass my final!" } selected = { selected } setSelected = {setSelected} stars = {4} />
      <SearchCard name = { "How to Parallel Park" } details = { "Morgan: Made me pass my California Driver's Test" } selected = { selected } setSelected = {setSelected} stars = {3}/>
      <SearchCard name = { "How to Dunk" } details = { "Ameya: It gave me the roadmap to become like Vince Carter." } selected = { selected } setSelected = {setSelected} stars = {1}/>
      <SearchCard name = { "Using YouTube API" } details = { "Gabriel: I built my project using what I learned here" } selected = { selected } setSelected = {setSelected} stars = {0}/>
    </div>
  )
}

function Lesson({ icon, name, details }) {
  const [state, setState] = useState("")

  if (state === "") {
    return (
      <div id = "lesson">
        <div style = {{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style = {{ display: "flex", fontSize: "2rem" }}>
            <img style = {{ marginRight: "1rem", width: "4rem", height: "4rem" }} src = { icon }></img>
            <h1>{ name }</h1>
          </div>
          <div style = {{ display: "flex", color: "black"}}>
            <button onClick = {() => setState("quiz")}>
              <img class = "lesson-icon" src = "undraw_rocket.svg"></img>
              <p style = {{color: "black"}}>Quiz</p>
            </button>
            <button onClick = {() => setState("chat")}>
              <img class = "lesson-icon" src = "undraw_chat-text.svg"></img>
              <p style = {{color: "black"}}>Chat</p>
            </button>
            <button onClick = {() => setState("context")}>
              <img class = "lesson-icon" src = "undraw_note.svg"></img>
              <p style = {{color: "black"}}>Context</p>
            </button>
            <button onClick = {() => setState("data")}>
              <img class = "lesson-icon" src = "undraw_cloud-upload.svg"></img>
              <p style = {{color: "black"}}>Add Data</p>
            </button>
          </div>
        </div>
        <hr style = {{ borderWidth: "2px", borderStyle: "solid", margin: "1rem" }}></hr>
        <p>Topics:</p>
        <ul>
          {details.map(topic => (
            <li>
              {topic}
            </li>
          ))}
        </ul>
      </div>
    )
  } else if (state === "quiz") {
    return (
      <div id = "lesson">
        <div style = {{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style = {{ display: "flex", fontSize: "2rem" }}>
            <img style = {{ marginRight: "1rem", width: "4rem", height: "4rem" }} src = { icon }></img>
            <h1>{ name }</h1>
          </div>
          <div style = {{ display: "flex", color: "black"}}>
            <button onClick = {() => setState("quiz")}>
              <img class = "lesson-icon" src = "undraw_rocket.svg"></img>
              <p style = {{color: "black"}}>Quiz</p>
            </button>
            <button onClick = {() => setState("chat")}>
              <img class = "lesson-icon" src = "undraw_chat-text.svg"></img>
              <p style = {{color: "black"}}>Chat</p>
            </button>
            <button onClick = {() => setState("context")}>
              <img class = "lesson-icon" src = "undraw_note.svg"></img>
              <p style = {{color: "black"}}>Context</p>
            </button>
            <button onClick = {() => setState("data")}>
              <img class = "lesson-icon" src = "undraw_cloud-upload.svg"></img>
              <p style = {{color: "black"}}>Add Data</p>
            </button>
          </div>
        </div>
        <hr style = {{ borderWidth: "2px", borderStyle: "solid", margin: "1rem" }}></hr>
        <br></br>
        <br></br>
        <br></br>
        <div>
          <div style = {{display: "flex", justifyContent: "space-between"}}>
            <h1>What is a HOF?</h1>
            <div style = {{display: "flex", width: "30rem", backgroundColor: "gray"}}>Horns on Fur</div>
            <div style = {{display: "flex", width: "30rem", backgroundColor: "white"}}>Horns on Fur</div>
            <div style = {{display: "flex", width: "30rem", backgroundColor: "gray"}}>Horns on Fur</div>
            <div style = {{display: "flex", width: "30rem", backgroundColor: "white"}}>Horns on Fur</div>
            <br></br>
            <div style = {{ width: "20%", backgroundColor: "purple", padding: "1rem", color: "white", textAlign: "center", borderTopRightRadius: "1rem", borderBottomRightRadius: "1rem"}}><p>Submit</p></div>
          </div>
        </div>
      </div>
    )
  } else if (state === "chat") {

    

    return (
      <div id = "lesson">
        <div style = {{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style = {{ display: "flex", fontSize: "2rem" }}>
            <img style = {{ marginRight: "1rem", width: "4rem", height: "4rem" }} src = { icon }></img>
            <h1>{ name }</h1>
          </div>
          <div style = {{ display: "flex", color: "black"}}>
            <button onClick = {() => setState("quiz")}>
              <img class = "lesson-icon" src = "undraw_rocket.svg"></img>
              <p style = {{color: "black"}}>Quiz</p>
            </button>
            <button onClick = {() => setState("chat")}>
              <img class = "lesson-icon" src = "undraw_chat-text.svg"></img>
              <p style = {{color: "black"}}>Chat</p>
            </button>
            <button onClick = {() => setState("context")}>
              <img class = "lesson-icon" src = "undraw_note.svg"></img>
              <p style = {{color: "black"}}>Context</p>
            </button>
            <button onClick = {() => setState("data")}>
              <img class = "lesson-icon" src = "undraw_cloud-upload.svg"></img>
              <p style = {{color: "black"}}>Add Data</p>
            </button>
          </div>
        </div>
        <hr style = {{ borderWidth: "2px", borderStyle: "solid", margin: "1rem" }}></hr>
        <div style = {{ display: "flex"}}>
          <input type = "text" style = {{ width: "70%", backgroundColor: "gray", padding: "1rem", color: "white", borderTopRightRadius: "0", borderBottomRightRadius: "0"}}></input>
          <div style = {{ width: "20%", backgroundColor: "purple", padding: "1rem", color: "white", textAlign: "center", borderTopRightRadius: "1rem", borderBottomRightRadius: "1rem"}}><p>Submit</p></div>
        </div>


        





      </div>
    )
  } else if (state === "context") {
    return (
      <div id = "lesson">
        <div style = {{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style = {{ display: "flex", fontSize: "2rem" }}>
            <img style = {{ marginRight: "1rem", width: "4rem", height: "4rem" }} src = { icon }></img>
            <h1>{ name }</h1>
          </div>
          <div style = {{ display: "flex", color: "black"}}>
            <button onClick = {() => setState("quiz")}>
              <img class = "lesson-icon" src = "undraw_rocket.svg"></img>
              <p style = {{color: "black"}}>Quiz</p>
            </button>
            <button onClick = {() => setState("chat")}>
              <img class = "lesson-icon" src = "undraw_chat-text.svg"></img>
              <p style = {{color: "black"}}>Chat</p>
            </button>
            <button onClick = {() => setState("context")}>
              <img class = "lesson-icon" src = "undraw_note.svg"></img>
              <p style = {{color: "black"}}>Context</p>
            </button>
            <button onClick = {() => setState("data")}>
              <img class = "lesson-icon" src = "undraw_cloud-upload.svg"></img>
              <p style = {{color: "black"}}>Add Data</p>
            </button>
          </div>
        </div>
        <hr style = {{ borderWidth: "2px", borderStyle: "solid", margin: "1rem" }}></hr>
        <h1>Training Data:</h1>
        <p>Chapter 1: Building Abstractions with Functions
1.1   Getting Started
Computer science is a tremendously broad academic discipline. The areas of globally distributed systems, artificial intelligence, robotics, graphics, security, scientific computing, computer architecture, and dozens of emerging sub-fields all expand with new techniques and discoveries every year. The rapid progress of computer science has left few aspects of human life unaffected. Commerce, communication, science, art, leisure, and politics have all been reinvented as computational domains.

The high productivity of computer science is only possible because the discipline is built upon an elegant and powerful set of fundamental ideas. All computing begins with representing information, specifying logic to process it, and designing abstractions that manage the complexity of that logic. Mastering these fundamentals will require us to understand precisely how computers interpret computer programs and carry out computational processes.

These fundamental ideas have long been taught using the classic textbook Structure and Interpretation of Computer Programs (SICP) by Harold Abelson and Gerald Jay Sussman with Julie Sussman. This text borrows heavily from that textbook, which the original authors have kindly licensed for adaptation and reuse under a Creative Commons license. These notes are published under the Creative Commons attribution non-commericial share-alike license version 3.

1.1.1   Programming in Python
A language isn't something you learn so much as something you join.

—Arika Okrent

In order to define computational processes, we need a programming language; preferably one that many humans and a great variety of computers can all understand. In this text, we will work primarily with the Python language.

Python is a widely used programming language that has recruited enthusiasts from many professions: web programmers, game engineers, scientists, academics, and even designers of new programming languages. When you learn Python, you join a million-person-strong community of developers. Developer communities are tremendously important institutions: members help each other solve problems, share their projects and experiences, and collectively develop software and tools. Dedicated members often achieve celebrity and widespread esteem for their contributions.

The Python language itself is the product of a large volunteer community that prides itself on the diversity of its contributors. The language was conceived and first implemented by Guido van Rossum in the late 1980's. The first chapter of his Python 3 Tutorial explains why Python is so popular, among the many languages available today.

Python excels as an instructional language because, throughout its history, Python's developers have emphasized the human interpretability of Python code, reinforced by the Zen of Python guiding principles of beauty, simplicity, and readability. Python is particularly appropriate for this text because its broad set of features support a variety of different programming styles, which we will explore. While there is no single way to program in Python, there are a set of conventions shared across the developer community that facilitate reading, understanding, and extending existing programs. Python's combination of great flexibility and accessibility allows students to explore many programming paradigms, and then apply their newly acquired knowledge to thousands of ongoing projects.

These notes maintain the spirit of SICP by introducing the features of Python in step with techniques for abstraction and a rigorous model of computation. In addition, these notes provide a practical introduction to Python programming, including some advanced language features and illustrative examples. Increasing your facility with Python should come naturally as you progress through the text.

The best way to get started programming in Python is to interact with the interpreter directly. This section describes how to install Python 3, initiate an interactive session with the interpreter, and start programming.

1.1.2   Installing Python 3
As with all great software, Python has many versions. This text will use the most recent stable version of Python 3. Many computers have older versions of Python installed already, such as Python 2.7, but those will not match the descriptions in this text. You should be able to use any computer, but expect to install Python 3. (Don't worry, Python is free.)

You can download Python 3 from the Python downloads page by clicking on the version that begins with 3 (not 2). Follow the instructions of the installer to complete installation.

For further guidance, try these video tutorials on Windows installation and Mac installation of Python 3, created by Julia Oh.

1.1.3   Interactive Sessions
In an interactive Python session, you type some Python code after the prompt, ---. The Python interpreter reads and executes what you type, carrying out your various commands.

To start an interactive session, run the Python 3 application. Type python3 at a terminal prompt (Mac/Unix/Linux) or open the Python 3 application in Windows.

If you see the Python prompt, ---, then you have successfully started an interactive session. These notes depict example interactions using the prompt, followed by some input.

--- 2 + 2
4
Interactive controls. Each session keeps a history of what you have typed. To access that history, press -Control--P (previous) and -Control--N (next). -Control--D exits a session, which discards this history. Up and down arrows also cycle through history on some systems.

1.1.4   First Example
And, as imagination bodies forth
The forms of things to unknown, and the poet's pen
Turns them to shapes, and gives to airy nothing
A local habitation and a name.
—William Shakespeare, A Midsummer-Night's Dream

To give Python a proper introduction, we will begin with an example that uses several language features. In the next section, we will start from scratch and build up the language piece by piece. Think of this section as a sneak preview of features to come.

Python has built-in support for a wide range of common programming activities, such as manipulating text, displaying graphics, and communicating over the Internet. The line of Python code

--- from urllib.request import urlopen
is an import statement that loads functionality for accessing data on the Internet. In particular, it makes available a function called urlopen, which can access the content at a uniform resource locator (URL), a location of something on the Internet.

Statements & Expressions. Python code consists of expressions and statements. Broadly, computer programs consist of instructions to either

Compute some value
Carry out some action
Statements typically describe actions. When the Python interpreter executes a statement, it carries out the corresponding action. On the other hand, expressions typically describe computations. When Python evaluates an expression, it computes the value of that expression. This chapter introduces several types of statements and expressions.

The assignment statement

--- shakespeare = urlopen('http://composingprograms.com/shakespeare.txt')
associates the name shakespeare with the value of the expression that follows =. That expression applies the urlopen function to a URL that contains the complete text of William Shakespeare's 37 plays, all in a single text document.

Functions. Functions encapsulate logic that manipulates data. urlopen is a function. A web address is a piece of data, and the text of Shakespeare's plays is another. The process by which the former leads to the latter may be complex, but we can apply that process using only a simple expression because that complexity is tucked away within a function. Functions are the primary topic of this chapter.

Another assignment statement

--- words = set(shakespeare.read().decode().split())
associates the name words to the set of all unique words that appear in Shakespeare's plays, all 33,721 of them. The chain of commands to read, decode, and split, each operate on an intermediate computational entity: we read the data from the opened URL, then decode the data into text, and finally split the text into words. All of those words are placed in a set.

Objects. A set is a type of object, one that supports set operations like computing intersections and membership. An object seamlessly bundles together data and the logic that manipulates that data, in a way that manages the complexity of both. Objects are the primary topic of Chapter 2. Finally, the expression

--- -w for w in words if len(w) == 6 and w[::-1] in words-
-'redder', 'drawer', 'reward', 'diaper', 'repaid'-
is a compound expression that evaluates to the set of all Shakespearian words that are simultaneously a word spelled in reverse. The cryptic notation w[::-1] enumerates each letter in a word, but the -1 dictates to step backwards. When you enter an expression in an interactive session, Python prints its value on the following line.

Interpreters. Evaluating compound expressions requires a precise procedure that interprets code in a predictable way. A program that implements such a procedure, evaluating compound expressions, is called an interpreter. The design and implementation of interpreters is the primary topic of Chapter 3.

When compared with other computer programs, interpreters for programming languages are unique in their generality. Python was not designed with Shakespeare in mind. However, its great flexibility allowed us to process a large amount of text with only a few statements and expressions.

In the end, we will find that all of these core concepts are closely related: functions are objects, objects are functions, and interpreters are instances of both. However, developing a clear understanding of each of these concepts and their role in organizing code is critical to mastering the art of programming.

1.1.5   Errors
Python is waiting for your command. You are encouraged to experiment with the language, even though you may not yet know its full vocabulary and structure. However, be prepared for errors. While computers are tremendously fast and flexible, they are also extremely rigid. The nature of computers is described in Stanford's introductory course as

The fundamental equation of computers is:

computer = powerful + stupid

Computers are very powerful, looking at volumes of data very quickly. Computers can perform billions of operations per second, where each operation is pretty simple.

Computers are also shockingly stupid and fragile. The operations that they can do are extremely rigid, simple, and mechanical. The computer lacks anything like real insight ... it's nothing like the HAL 9000 from the movies. If nothing else, you should not be intimidated by the computer as if it's some sort of brain. It's very mechanical underneath it all.

Programming is about a person using their real insight to build something useful, constructed out of these teeny, simple little operations that the computer can do.

—Francisco Cai and Nick Parlante, Stanford CS101

The rigidity of computers will immediately become apparent as you experiment with the Python interpreter: even the smallest spelling and formatting changes will cause unexpected output and errors.

Learning to interpret errors and diagnose the cause of unexpected errors is called debugging. Some guiding principles of debugging are:

Test incrementally: Every well-written program is composed of small, modular components that can be tested individually. Try out everything you write as soon as possible to identify problems early and gain confidence in your components.
Isolate errors: An error in the output of a statement can typically be attributed to a particular modular component. When trying to diagnose a problem, trace the error to the smallest fragment of code you can before trying to correct it.
Check your assumptions: Interpreters do carry out your instructions to the letter — no more and no less. Their output is unexpected when the behavior of some code does not match what the programmer believes (or assumes) that behavior to be. Know your assumptions, then focus your debugging effort on verifying that your assumptions actually hold.
Consult others: You are not alone! If you don't understand an error message, ask a friend, instructor, or search engine. If you have isolated an error, but can't figure out how to correct it, ask someone else to take a look. A lot of valuable programming knowledge is shared in the process of group problem solving.
Incremental testing, modular design, precise assumptions, and teamwork are themes that persist throughout this text. Hopefully, they will also persist throughout your computer science career.

Continue: 1.2 Elements of Programming</p>
        
      </div>
    )
  } else if (state === "add") {
    return (
      <div id = "lesson">
        <div style = {{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style = {{ display: "flex", fontSize: "2rem" }}>
            <img style = {{ marginRight: "1rem", width: "4rem", height: "4rem" }} src = { icon }></img>
            <h1>{ name }</h1>
          </div>
          <div style = {{ display: "flex", color: "black"}}>
            <button onClick = {() => setState("quiz")}>
              <img class = "lesson-icon" src = "undraw_rocket.svg"></img>
              <p style = {{color: "black"}}>Quiz</p>
            </button>
            <button onClick = {() => setState("chat")}>
              <img class = "lesson-icon" src = "undraw_chat-text.svg"></img>
              <p style = {{color: "black"}}>Chat</p>
            </button>
            <button onClick = {() => setState("context")}>
              <img class = "lesson-icon" src = "undraw_note.svg"></img>
              <p style = {{color: "black"}}>Context</p>
            </button>
            <button onClick = {() => setState("data")}>
              <img class = "lesson-icon" src = "undraw_cloud-upload.svg"></img>
              <p style = {{color: "black"}}>Add Data</p>
            </button>
          </div>
        </div>
        <hr style = {{ borderWidth: "2px", borderStyle: "solid", margin: "1rem" }}></hr>
        <p>Import via Plaintext</p>
        <input type = "text" id = "grab-here"/>
        <p>Import via YouTube</p>
        <input type = "text" id = "grab-here"/>
        <p>Import via Website URL</p>
        <input type = "text" id = "grab-here"/>
        <br/>
        <br/>
        <button style = {{ padding: "1rem", width: "11.5rem", color: "white", backgroundColor: "purple", fontSize: "2rem", borderRadius: "2rem"}}>
          Submit
        </button>
      </div>
    )
  }
  else if (state === "data") {
    return (
      <div id = "lesson">
        <div style = {{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style = {{ display: "flex", fontSize: "2rem" }}>
            <img style = {{ marginRight: "1rem", width: "4rem", height: "4rem" }} src = { icon }></img>
            <h1>{ name }</h1>
          </div>
          <div style = {{ display: "flex", color: "black"}}>
            <button onClick = {() => setState("quiz")}>
              <img class = "lesson-icon" src = "undraw_rocket.svg"></img>
              <p style = {{color: "black"}}>Quiz</p>
            </button>
            <button onClick = {() => setState("chat")}>
              <img class = "lesson-icon" src = "undraw_chat-text.svg"></img>
              <p style = {{color: "black"}}>Chat</p>
            </button>
            <button onClick = {() => setState("context")}>
              <img class = "lesson-icon" src = "undraw_note.svg"></img>
              <p style = {{color: "black"}}>Context</p>
            </button>
            <button onClick = {() => setState("data")}>
              <img class = "lesson-icon" src = "undraw_cloud-upload.svg"></img>
              <p style = {{color: "black"}}>Add Data</p>
            </button>
          </div>
        </div>
        <hr style = {{ borderWidth: "2px", borderStyle: "solid", margin: "1rem" }}></hr>
        <p>Add via Plaintext</p>
        <input type = "text" id = "grab-here"/>
        <p>Add via YouTube</p>
        <input type = "text" id = "grab-here"/>
        <p>Add via Website URL</p>
        <input type = "text" id = "grab-here"/>
        <br/>
        <br/>
        <button style = {{ padding: "1rem", width: "11.5rem", color: "white", backgroundColor: "purple", fontSize: "2rem", borderRadius: "2rem"}}>
          Submit
        </button>
      </div>
    )
  }
}

function NewLesson({ setNewLesson }) {
  return (
    <div id = "lesson">
      <div style = {{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style = {{ display: "flex", fontSize: "2rem" }}>
          <img style = {{ marginRight: "1rem", width: "4rem", height: "4rem" }} src = "undraw_chevrons.svg"></img>
          <h1>Create a new Lesson</h1>
        </div>
      </div>
      <hr style = {{ borderWidth: "2px", borderStyle: "solid", margin: "1rem" }}></hr>
      <p>Import via Plaintext</p>
      <input type = "text" id = "grab-here"/>
      <p>Import via YouTube</p>
      <input type = "text" id = "grab-here"/>
      <p>Import via Website URL</p>
      <input type = "text" id = "grab-here"/>
      <br/>
      <br/>
      <button style = {{ padding: "1rem", width: "11.5rem", color: "white", backgroundColor: "purple", fontSize: "2rem", borderRadius: "2rem"}}>
        Submit
      </button>
    </div>
  )
}

function HomeCard({ icon, name, details, selected, setSelected }) {
  return (
    <button class = "home-card" onClick = {() => setTimeout(() => {setSelected(name)}, 200)}>
      <div class = "card-head">
        <img src = { icon }></img>
        <p> { name } </p>
      </div>
      <div class = "home-card-details">
        <p>Continue learning...</p>
        <ul>
          <li>{ details[0] }</li>
          <li>{ details[1] }</li>
          <li>{ details[2] }</li>
        </ul>
      </div>
    </button>
  )
}

function SearchCard({ name, details, selected, setSelected, stars }) {
  return (
    <>
      <button class = "home-card" style = {{height: "8rem", marginBottom: "6rem"}}onClick = {() => setTimeout(() => {setSelected(name)}, 200)}>
        <div class = "card-head">
          <p> { name } </p>
        </div>
        <div class = "home-card-details">
          <p>{details}</p>
        </div>
        <div style = {{display: "flex", justifyContent: "center", position: "relative", top: "3.5rem", color: "black"}}>
          <img src = "undraw_star.svg"></img>
          <h1>{stars}</h1>
        </div>
      </button>
    </>
  )
}

function Sidebar({ selected, setSelected })  {
  return (
    <div id = "sidebar">
      <Section icon = { "undraw_command-button.svg" } name = { "Home" } selected = { selected } setSelected = {setSelected}/>
      <Section icon = { "undraw_code.svg" } name = { "CS61A Functions" } selected = { selected } setSelected = {setSelected}/>
      <Section icon = { "undraw_chat-text.svg" } name = { "Food in Chinese" } selected = { selected } setSelected = {setSelected}/>
      <button class = "section" id = "search" onClick = { () => setSelected("search")}>
        <img src = "undraw_circled-arrow.svg"></img>
        <p>Search Lessons</p>
      </button>
    </div>
  )
}

function Section({ icon, name, selected, setSelected }) {
  if (selected === name) {
    return (
      <button class = "section" id = "selected">
        <img src = { icon }></img>
        <p>{ name }</p>
      </button>
    )
  }
  return (
    <button class = "section" onClick = {() => setTimeout(() => {setSelected(name)}, 200)}>
      <img src = { icon }></img>
      <p>{ name }</p>
    </button>
  )
}

export default App
