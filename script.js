"use strict";

const btn = document.getElementById("flat-tire-btn");
const btn2 = document.getElementById("brakes-btn");
const btn3 = document.getElementById("chain-btn");
const btn4 = document.getElementById("send");
let index = 0;

const workshopBanner = [
  "WORKSHOPS",
  "Friday & Saturdays",
  "2:00 pm",
  "Free",
  "Come and learn while having Fun!",
];

btn.addEventListener("click", function () {
  const targetElement = document.getElementById("flat-tire");

 
  targetElement.scrollIntoView({ behavior: "smooth" });
});

btn2.addEventListener("click", function () {
  const targetElement = document.getElementById("brake-adjust");

  targetElement.scrollIntoView({ behavior: "smooth" });
});

btn3.addEventListener("click", function () {
  const targetElement = document.getElementById("chain-maintain");

  targetElement.scrollIntoView({ behavior: "smooth" });
});

setInterval(() => {
  document.getElementById("workshops").textContent = workshopBanner[index];
  index = (index + 1) % workshopBanner.length;
}, 1500);

class Bike {
  constructor(style, brand, condition, price) {
    this.style = style;
    this.brand = brand;
    this.condition = condition;
    this.price = price;
  }
}
const bike = [
  new Bike("Mens frame", "Fuji", "Fair", "$50.00"),
  new Bike("Womens frame", "Trek", "Good", "$75.00"),
  new Bike("Mountain bike", "Giant", "New", "$150.00"),
  new Bike("Road bike", "Specialized", "Excellent", "$200.00"),
  new Bike("Kids frame", "Huffy", "Fair", "Free"),
  new Bike("Mens", "Schwinn", "Needs some love", "Free"),
  new Bike("Womens Frame", "Canondale", "Pretty good", "Looking to trade"),
  new Bike("Womens Frame", "Huffy", "Pretty good", "Free"),
  new Bike("Mountain bike", "Scott", "Great", "$175.00 or Trade"),
  new Bike("Road bike", "no name", "frame only", "Free"),
];

function renderBikes(bikeArray) {
  const bikeContainer = document.getElementById("sell-trade");
  bikeContainer.innerHTML = "";

  const bikeListing = document.createElement("ul");
  bikeListing.className = " list-disc rounded flex flex-wrap p-6 gap-6 mt-15 bg-gray-600";

  bikeArray.forEach((bike) => {
    const listItem = document.createElement("li");
    listItem.className = "bike-item p-4 text-white justify-between";

    listItem.innerHTML = `
            <h2>${bike.style} - ${bike.brand}</h2>
            <p>Condition: ${bike.condition}</p>
            <p>Price: ${bike.price}</p>
        `;
    bikeListing.appendChild(listItem);
  });
  bikeContainer.appendChild(bikeListing);
}
renderBikes(bike);

const chatHistoryDiv = document.getElementById("chatHistory");
const userInput = document.getElementById("userInput");

const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

function addtoStorage(sender, text) {
  chatHistory.push({ sender, text });
  if (chatHistory.length > 5) {
    chatHistory.shift();
  }
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function renderNewMessage(sender, text) {
  chatHistoryDiv.innerHTML += `<p>${sender}: ${text}</p>`;
}

async function fetchApiKey() {
  const config = {
    method: "POST",
    headers: { "content-Type": "application/json" },
    body: JSON.stringify({ message: "THANK YOU VERY MUCH" }),
  };
  try {
    const res = await fetch(
      "https://proxy-key-5p1u.onrender.com/get-key",
      config
    );
    if (res.status != 200) {
      throw new Error("could not get key");
    }

    const data = await res.json();
    return data.key;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function sendMessageToGemini(userMessage) {
  try {
    const key = await fetchApiKey();

    if (!key) {
      renderNewMessage("error:", "no key");
      throw new Error("no key");
    }
    const instructions =
      "| you are a chatbot named Felix. -We offer bicycles for sale or trade,the list is updated weekly. we offer free workshops year round. do not use more than 20 words   per response. respond only to bikcyle related questions.|"

    const config = {
      method: "POST",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  userMessage +
                  instructions +
                  "after this line is our chat history" +
                  chatHistory,
              },
            ],
          },
        ],
      }),
    };
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";
    const res = await fetch(url + key, config);

    if (res.status != 200) {
      throw new Error("Felix is sleeping now try back later");
    }

    const data = await res.json();
    renderNewMessage("Felix", data.candidates[0].content.parts[0].text);
    addtoStorage("Felix", data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error(error);
  }
}

btn4.addEventListener("click", () => {
  const message = userInput.value.trim();
  if (message) {
    renderNewMessage("user", message);
    userInput.value = "";
    sendMessageToGemini(message);
    addtoStorage("user", message);
  }
});

