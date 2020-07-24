const admin = require('firebase-admin')
const serviceAccount = require('./fir-97ec6-firebase-adminsdk-h3nlv-b50471b1d2.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const db = admin.firestore();

addData = async (data) => {
    await db.collection('chat').doc(data.room).set(data)
    // await db.collection('chat').add(data);
    // console.log('Added document with ID: ', res.id);
    return "success";
}

getData = async (room) => {
    const doc = await db.collection('chat').doc(room).get()
    if(!doc.exists) {
        console.log('No such document!');
    } else {
        console.log('Document data:', doc.data());
    }
    return doc.data()
}

module.exports = {
    addData,
    getData
}