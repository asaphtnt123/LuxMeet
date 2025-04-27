// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-7HOp-Ycvyf3b_03ev__8aJEwAbWSQZY",
  authDomain: "connectfamilia-312dc.firebaseapp.com",
  projectId: "connectfamilia-312dc",
  storageBucket: "connectfamilia-312dc.appspot.com",
  messagingSenderId: "797817838649",
  appId: "1:797817838649:web:1aa7c54abd97661f8d81e8",
  measurementId: "G-QKN9NFXZZQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Variável para armazenar o modal
let modal;

// Função para abrir e fechar modal
function setupModal(modalId, openButtonId, closeButtonClass) {
  modal = document.getElementById(modalId); // Atribui o modal à variável global
  
  var btn = document.getElementById(openButtonId);
  var span = modal.getElementsByClassName(closeButtonClass)[0];

  btn.onclick = function() {
    modal.style.display = "block";
  }

  span.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

// Inicialização dos modais
document.addEventListener('DOMContentLoaded', function() {
  setupModal('cadastro-modal', 'open-cadastro', 'close-cadastro');
  setupModal('login-modal', 'open-login', 'close-login');
});


// Função para exibir/esconder campos de interesse baseado no tipo de usuário selecionado
function toggleInterestFields() {
  const tipouser = document.getElementById('tipouser').value;
  const interestFields = document.getElementById('interestFields');
  const interestInSelect = document.getElementById('interest_in');

  if (tipouser === 'sugar_baby') {
    interestFields.style.display = 'block';
    interestInSelect.setAttribute('required', 'true');
  } else {
    interestFields.style.display = 'none';
    interestInSelect.removeAttribute('required');
  }
}

// Submissão do formulário de cadastro
document.getElementById('cadastro-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const cidade = document.getElementById('cidade').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const dateOfBirth = document.getElementById('date_of_birth').value;
  const gender = document.getElementById('gender').value;
  const tipouser = document.getElementById('tipouser').value;
  const income = document.getElementById('income').value;
  const bio = document.getElementById('bio').value;

  // Obtém o arquivo da foto de perfil selecionada
  const profilePhotoFile = document.getElementById('profile_photo').files[0];
  const storageRef = firebase.storage().ref();
  const profilePhotoPath = `profile_photos/${email}/${profilePhotoFile.name}`;
  const profilePhotoRef = storageRef.child(profilePhotoPath);

  // Faz o upload da foto de perfil para o Firebase Storage
  profilePhotoRef.put(profilePhotoFile).then((snapshot) => {
    console.log('Foto de perfil carregada com sucesso');
    // Obtém a URL de download da foto carregada
    return profilePhotoRef.getDownloadURL();
  }).then((profilePhotoURL) => {
    // Cria o usuário no Firebase Authentication
    return auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Obtém o usuário criado
        const user = userCredential.user;

        // Cria um objeto com os dados do usuário para salvar no Firestore
        let userData = {
          userId: user.uid,
          name: name,
          cidade: cidade,
          email: email,
          dateOfBirth: dateOfBirth,
          gender: gender,
          tipouser: tipouser,
          income: income,
          bio: bio,
          profilePhotoURL: profilePhotoURL  // Salva a URL da foto de perfil
        };

        // Se o usuário for sugar baby, adiciona o interesse específico
        if (tipouser === 'sugar_baby') {
          userData.interestIn = interestIn;
        }

        // Salva os dados do usuário no Firestore
        return db.collection('users').doc(user.uid).set(userData);
      });
  }).then(() => {
    alert('Cadastro realizado com sucesso!');
    modal.style.display = 'none';
    document.getElementById('cadastro-form').reset();
  }).catch((error) => {
    console.error('Erro no cadastro: ', error);
    alert('Erro no cadastro: ' + error.message);
  });
});


// Submissão do formulário de login
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;

      alert('Login realizado com sucesso!');
      modal.style.display = 'none';

      // Redirecionar para a homepage.html passando o ID do usuário como parâmetro
      window.location.href = `homepage.html?userId=${user.uid}`;
    })
    .catch(error => {
      console.error('Erro no login: ', error);
      alert('Erro no login: ' + error.message);
    });
});

// Abrir o modal de cadastro ao clicar em "Cadastrar"
document.getElementById('open-cadastro').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('cadastro-modal').style.display = 'block';
  document.getElementById('login-modal').style.display = 'none'; // Garante que o modal de login está fechado
});

// Abrir o modal de login ao clicar em "Login"
document.getElementById('open-login').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('login-modal').style.display = 'block';
  document.getElementById('cadastro-modal').style.display = 'none'; // Garante que o modal de cadastro está fechado
});
