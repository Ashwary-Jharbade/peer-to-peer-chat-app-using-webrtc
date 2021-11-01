// Free public STUN servers provided by Google.
const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

// Variables
let option;
const userCont = document.getElementById("user-continue");
const userModelObj = document.getElementById("staticBackdrop");
const sendMessageBtn = document.getElementById("send-message-button");
const chats = document.getElementById("chats");
const sysOffer = document.getElementById("system-offer");
const getOfferBtn = document.getElementById("get-offer");
const closeOfferModel = document.getElementById("close-offer-model");
const copyLocalOffer = document.getElementById("copy-local-offer");
const acceptOffer = document.getElementById("accept-offer");
const setOffer = document.getElementById("set-offer");
const saveConnectionOffer = document.getElementById("save-connection-offer");
const closeConnection = document.getElementById("close-connection");
const closeConnectionOfferModel = document.getElementById(
  "close-connection-offer-model"
);
let userName = "Robot";

// WebRTC varibales
let localConnection = new RTCPeerConnection(iceServers);
let offerArray = [];
let dataChannel;

function chatConnection() {
  dataChannel = localConnection.createDataChannel("channel");
  localConnection
    .createOffer()
    .then((o) => localConnection.setLocalDescription(o))
    .then(() => console.log("Set Successfully"));

  localConnection.onicecandidate = (e) => {
    offerArray.push(JSON.stringify(localConnection.localDescription));
  };

  dataChannel.onopen = (e) => {
    console.log("conection opened");
  };

  dataChannel.onmessage = (e) => {
    const remoteMessage = deSerializeMessage(e.data);
    updateRemoteMessage(remoteMessage);
  };
}

function createRemoteDescription(answer) {
  const ans = JSON.parse(answer);
  if (option) {
    localConnection.setRemoteDescription(ans);
  } else {
    localConnection.onicecandidate = (e) => {
      offerArray.push(JSON.stringify(localConnection.localDescription));
    };
    localConnection.ondatachannel = (e) => {
      localConnection.dataChannel = e.channel;
      localConnection.dataChannel.onmessage = (e) => {
        const remoteMessage = deSerializeMessage(e.data);
        updateRemoteMessage(remoteMessage);
      };
      localConnection.dataChannel.onopen = (e) => {
        console.log("Connection opened");
      };
    };
    localConnection
      .setRemoteDescription(ans)
      .then((a) => console.log("Offer set"));
    localConnection
      .createAnswer()
      .then((a) => localConnection.setLocalDescription(a))
      .then((a) => console.log("Answer created"));
  }
}

function elementWithValue(ele, cls, id, value) {
  const obj = element(ele, cls, id);
  obj.innerHTML = value;
  return obj;
}

function element(ele, cls, id) {
  const obj = document.createElement(ele);
  obj.classList = cls;
  obj.id = id;
  return obj;
}

function getNormalizeTime() {
  let date = new Date();
  let hr = date.getHours();
  let min = date.getMinutes();
  if (hr > 12) {
    return `${hr - 12}:${min}pm`;
  }
  return `${hr}:${min}pm`;
}

function updateRemoteMessage(message) {
  const div = "div";
  const messageContainer = element(
    div,
    "message-container remote-message-container",
    ""
  );
  const remoteMessage = element(div, "remote-message", "");
  const userName = elementWithValue(div, "chat-username", "", message.name);
  const messageObj = elementWithValue(div, "", "", message.message);
  const chatTime = elementWithValue(div, "chat-time", "", getNormalizeTime());
  remoteMessage.append(userName);
  remoteMessage.append(messageObj);
  remoteMessage.append(chatTime);
  messageContainer.append(remoteMessage);
  chats.append(messageContainer);
  messageContainer.scrollIntoView();
}

function updateLocalMessage(message) {
  const div = "div";
  const messageContainer = element(
    div,
    "message-container local-message-container",
    ""
  );
  const localMessage = element(div, "local-message", "");
  const userName = elementWithValue(div, "chat-username", "", message.name);
  const messageObj = elementWithValue(div, "", "", message.message);
  const chatTime = elementWithValue(div, "chat-time", "", getNormalizeTime());
  localMessage.append(userName);
  localMessage.append(messageObj);
  localMessage.append(chatTime);
  messageContainer.append(localMessage);
  chats.append(messageContainer);
  messageContainer.scrollIntoView();
}

function sendMessage(message) {
  const sendSerialize = serializeMessage(message);
  if (option) {
    dataChannel.send(sendSerialize);
  } else {
    localConnection.dataChannel.send(sendSerialize);
  }
}

function serializeMessage(message) {
  return JSON.stringify(message);
}

function deSerializeMessage(message) {
  return JSON.parse(message);
}

function copyFunction(id) {
  var copyText = document.getElementById(id);
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
}

// Event listeners

closeConnection.addEventListener("click", () => {
  if (option) {
    dataChannel = null;
    localConnection = null;
  } else {
    localConnection.dataChannel = null;
    localConnection = null;
  }
  offerArray = [];
});

closeConnectionOfferModel.addEventListener("click", () => {
  acceptOffer.style.display = "none";
});

saveConnectionOffer.addEventListener("click", () => {
  const value = document.getElementById("connection-offer").value;
  if (value) {
    acceptOffer.style.display = "none";
    createRemoteDescription(value);
  } else {
    alert("Enter valid value");
  }
});

setOffer.addEventListener("click", () => {
  acceptOffer.style.display = "block";
});

copyLocalOffer.addEventListener("click", () => {
  copyFunction("sdp-offer");
});

getOfferBtn.addEventListener("click", () => {
  sysOffer.style.display = "block";
  document.getElementById("sdp-offer").value = offerArray[0];
});

closeOfferModel.addEventListener("click", () => {
  sysOffer.style.display = "none";
});

userCont.addEventListener("click", () => {
  const username = document.getElementById("name-field");
  userName = username.value;
  if (userName) {
    // if (confirm(`Others will recognise by name ${userName}`))
    userModelObj.style.display = "none";
  } else {
    alert("Enter a valid name!");
  }
});

sendMessageBtn.addEventListener("click", () => {
  const textValue = document.getElementById("text-message").value;
  if (textValue) {
    const message = {
      name: userName,
      message: textValue,
    };
    sendMessage(message);
    updateLocalMessage(message);
  }
});

window.onload = () => {
  option = confirm("Would you be sending connection request ?");
  userModelObj.style.display = "block";
  if (option) {
    chatConnection();
  }
};
