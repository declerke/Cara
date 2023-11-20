// Initialize Firebase
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const productsCollection = db.collection('products');

productsCollection.get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const productData = doc.data();
            console.log('Product data:', productData);
            // Handle the product data, e.g., render it on your webpage
        });
    })
    .catch((error) => {
        console.error('Error getting products:', error);
    });

    // Call fetchProductData when the page loads
     fetchProductData();
     // Fetches product data from the database and adds it to the DOM

