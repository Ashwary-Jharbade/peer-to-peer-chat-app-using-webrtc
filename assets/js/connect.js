const localConnection = new RTCPeerConnection();
const dataChannel = localConnection.createDataChannel("channel");
let offerArray = [];
let remoteAnswer;
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
