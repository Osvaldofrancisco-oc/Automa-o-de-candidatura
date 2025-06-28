const nodemailer = require('nodemailer');
const fs = require('fs');
const csv = require('csv-parser');

require('dotenv').config(); // 👈 Deve estar antes de usar process.env

// const emailp = process.env.EMAIL;
// const password = process.env.PASSWORD;

// console.log(emailp, password);

// Função para ler arquivo CSV e retornar uma Promise com os dados
function lerCSV(caminho) {
  return new Promise((resolve, reject) => {
    const resultados = [];
    fs.createReadStream(caminho)
      .pipe(csv())
      .on('data', (data) => resultados.push(data))
      .on('end', () => resolve(resultados))
      .on('error', (err) => reject(err));
  });
}

function extrairNomeDoEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.warn('⚠️ Email inválido ou indefinido:', email);
    return 'Candidato';
  }
  const parteLocal = email.split('@')[0];
  const partes = parteLocal.split(/[._-]/); // quebra em ".", "_" ou "-"
  const nomeFormatado = partes
    .map(p => p.length === 2 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
  return nomeFormatado;
}


// Criar o corpo do email em HTML
function criarMensagemHTML(email, empresa) {
  const nome = extrairNomeDoEmail(email);

  return `
    <p>Prezado(a) <strong>${nome}</strong>,</p>

    <p>
    Estou entrando em contato para manifestar meu interesse em uma possível oportunidade na 
    <strong>${empresa}</strong>. Tenho experiência com tecnologias com consta no CV,
    e acredito que posso contribuir positivamente com a sua equipe.
    </p>

    <p>
    Anexo o meu currículo para avaliação e fico à disposição para mais esclarecimentos ou uma conversa.
    </p>

    <p>
    Atenciosamente,<br>
    <strong>Osvaldo Canhama</strong>
    </p>
  `;
}


// Criar transportador SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:'p3874525@gmail.com',
    pass:'olxd utso mani wzar'
  }
});

// Função para enviar emails com atraso
function enviarComIntervalo(lista, intervalo = 3000) {
  lista.forEach((contato, index) => {
    setTimeout(() => {
      const mailOptions = {
  from: 'p3874525@gmail.com',
  to: contato.email,
  subject: `Candidatura espontânea para a ${contato.empresa}`,
  html: criarMensagemHTML(contato.nome, contato.empresa),
  attachments: [
    {
      filename: 'Osvaldocanhama.pdf',
      path: './Osvaldocanhama.pdf', // Caminho para o arquivo
      contentType: 'application/pdf'
    }
  ]
};
;

      transporter.sendMail(mailOptions, (erro, info) => {
        const logMsg = erro
          ? `❌ Erro ao enviar para ${contato.email}: ${erro.message}\n`
          : `✅ Email enviado para ${contato.email}: ${info.response}\n`;

        // Escrever log no arquivo log.txt
        fs.appendFileSync('log.txt', logMsg);

        // Mostrar no console também
        console.log(logMsg.trim());
      });

    }, index * intervalo);
  });
}

// Executar
(async () => {
  try {
    const contatos = await lerCSV('emails.csv');
    enviarComIntervalo(contatos, 3000);
  } catch (err) {
    console.error('Erro ao ler o CSV:', err.message);
  }
})();
