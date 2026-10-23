// Cole aqui o Application ID do bot para ativar o botão "Adicionar ao Discord".
  const CLIENT_ID = "";
  const PERMISSIONS = 3165184; // Ver Canal, Enviar Mensagens, Inserir Links, Conectar, Falar
  if (CLIENT_ID) {
    const invite = document.getElementById("invite");
    invite.href = "https://discord.com/oauth2/authorize?client_id=" + CLIENT_ID +
      "&permissions=" + PERMISSIONS + "&scope=bot%20applications.commands";
    invite.textContent = "Adicionar ao Discord";
  }