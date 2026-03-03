import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminEmail = "henriquer01@rojasdev.cloud";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminPassword = await hash("Admin@123", 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPassword,
        name: "Admin",
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

    // Create active subscription for admin
    await prisma.subscription.create({
      data: {
        userId: admin.id,
        status: "ACTIVE",
        startedAt: new Date(),
        externalReference: "admin_seed",
      },
    });

    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Check if Bible verses already exist
  const verseCount = await prisma.bibleVerse.count();
  if (verseCount > 0) {
    console.log(`Bible verses already exist: ${verseCount} verses`);
    return;
  }

  // Import Bible verses - using sample verses for the seed
  // In production, you would import the full NVI Bible from a JSON file
  const sampleVerses = [
    // Genesis
    { book: "Gênesis", chapter: 1, verse: 1, text: "No princípio Deus criou os céus e a terra." },
    { book: "Gênesis", chapter: 1, verse: 2, text: "Era a terra sem forma e vazia; trevas cobriam a face do abismo, e o Espírito de Deus se movia sobre a face das águas." },
    { book: "Gênesis", chapter: 1, verse: 3, text: "Disse Deus: 'Haja luz', e houve luz." },

    // John 3:16
    { book: "João", chapter: 3, verse: 16, text: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna." },
    { book: "João", chapter: 3, verse: 17, text: "Pois Deus enviou o seu Filho ao mundo, não para condenar o mundo, mas para que este fosse salvo por meio dele." },

    // Psalms 23
    { book: "Salmos", chapter: 23, verse: 1, text: "O Senhor é o meu pastor; nada me faltará." },
    { book: "Salmos", chapter: 23, verse: 2, text: "Em verdes pastagens me faz repousar e me conduz a águas tranquilas;" },
    { book: "Salmos", chapter: 23, verse: 3, text: "restaura-me o vigor. Guia-me nas veredas da justiça por amor do seu nome." },
    { book: "Salmos", chapter: 23, verse: 4, text: "Mesmo que eu ande pelo vale da sombra da morte, não temerei perigo algum, pois tu estás comigo; a tua vara e o teu cajado me protegem." },
    { book: "Salmos", chapter: 23, verse: 5, text: "Preparas um banquete para mim à vista dos meus inimigos. Tu me unges a cabeça com óleo; o meu cálice transborda." },
    { book: "Salmos", chapter: 23, verse: 6, text: "Sei que a bondade e a fidelidade me acompanharão todos os dias da minha vida, e voltarei à casa do Senhor enquanto eu viver." },

    // Romans 8
    { book: "Romanos", chapter: 8, verse: 28, text: "Sabemos que Deus age em todas as coisas para o bem daqueles que o amam, dos que foram chamados de acordo com o seu propósito." },
    { book: "Romanos", chapter: 8, verse: 31, text: "Que diremos, pois, diante dessas coisas? Se Deus é por nós, quem será contra nós?" },
    { book: "Romanos", chapter: 8, verse: 38, text: "Pois estou convencido de que nem morte nem vida, nem anjos nem demônios, nem o presente nem o futuro, nem quaisquer poderes," },
    { book: "Romanos", chapter: 8, verse: 39, text: "nem altura nem profundidade, nem qualquer outra coisa na criação será capaz de nos separar do amor de Deus que está em Cristo Jesus, nosso Senhor." },

    // 1 Corinthians 13 (Love chapter)
    { book: "1 Coríntios", chapter: 13, verse: 1, text: "Ainda que eu fale as línguas dos homens e dos anjos, se não tiver amor, serei como o sino que ressoa ou como o prato que retine." },
    { book: "1 Coríntios", chapter: 13, verse: 4, text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha." },
    { book: "1 Coríntios", chapter: 13, verse: 5, text: "Não maltrata, não procura seus interesses, não se ira facilmente, não guarda rancor." },
    { book: "1 Coríntios", chapter: 13, verse: 6, text: "O amor não se alegra com a injustiça, mas se alegra com a verdade." },
    { book: "1 Coríntios", chapter: 13, verse: 7, text: "Tudo sofre, tudo crê, tudo espera, tudo suporta." },
    { book: "1 Coríntios", chapter: 13, verse: 8, text: "O amor nunca perece; mas as profecias desaparecerão, as línguas cessarão, o conhecimento passará." },
    { book: "1 Coríntios", chapter: 13, verse: 13, text: "Assim, permanecem agora estes três: a fé, a esperança e o amor. O maior deles, porém, é o amor." },

    // Proverbs
    { book: "Provérbios", chapter: 3, verse: 5, text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento;" },
    { book: "Provérbios", chapter: 3, verse: 6, text: "reconheça o Senhor em todos os seus caminhos, e ele endireitará as suas veredas." },

    // Philippians
    { book: "Filipenses", chapter: 4, verse: 6, text: "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus." },
    { book: "Filipenses", chapter: 4, verse: 7, text: "E a paz de Deus, que excede todo o entendimento, guardará o coração e a mente de vocês em Cristo Jesus." },
    { book: "Filipenses", chapter: 4, verse: 13, text: "Tudo posso naquele que me fortalece." },

    // Isaiah
    { book: "Isaías", chapter: 40, verse: 31, text: "mas aqueles que esperam no Senhor renovam as suas forças. Voam alto como águias; correm e não ficam exaustos, andam e não se cansam." },
    { book: "Isaías", chapter: 41, verse: 10, text: "Não tema, pois estou com você; não tenha medo, pois sou o seu Deus. Eu o fortalecerei e o ajudarei; eu o segurarei com a minha mão direita vitoriosa." },

    // Matthew
    { book: "Mateus", chapter: 5, verse: 3, text: "Bem-aventurados os pobres em espírito, pois deles é o Reino dos céus." },
    { book: "Mateus", chapter: 5, verse: 4, text: "Bem-aventurados os que choram, pois serão consolados." },
    { book: "Mateus", chapter: 5, verse: 5, text: "Bem-aventurados os humildes, pois eles receberão a terra por herança." },
    { book: "Mateus", chapter: 5, verse: 6, text: "Bem-aventurados os que têm fome e sede de justiça, pois serão satisfeitos." },
    { book: "Mateus", chapter: 5, verse: 7, text: "Bem-aventurados os misericordiosos, pois obterão misericórdia." },
    { book: "Mateus", chapter: 5, verse: 8, text: "Bem-aventurados os puros de coração, pois verão a Deus." },
    { book: "Mateus", chapter: 5, verse: 9, text: "Bem-aventurados os pacificadores, pois serão chamados filhos de Deus." },
    { book: "Mateus", chapter: 6, verse: 33, text: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas serão acrescentadas a vocês." },
    { book: "Mateus", chapter: 11, verse: 28, text: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso a vocês." },
    { book: "Mateus", chapter: 11, verse: 29, text: "Tomem sobre vocês o meu jugo e aprendam de mim, pois sou manso e humilde de coração, e vocês encontrarão descanso para as suas almas." },
    { book: "Mateus", chapter: 28, verse: 19, text: "Portanto, vão e façam discípulos de todas as nações, batizando-os em nome do Pai e do Filho e do Espírito Santo," },
    { book: "Mateus", chapter: 28, verse: 20, text: "ensinando-os a obedecer a tudo o que eu ordenei a vocês. E eu estarei sempre com vocês, até o fim dos tempos." },

    // Hebrews
    { book: "Hebreus", chapter: 11, verse: 1, text: "Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos." },
    { book: "Hebreus", chapter: 11, verse: 6, text: "Sem fé é impossível agradar a Deus, pois quem dele se aproxima precisa crer que ele existe e que recompensa aqueles que o buscam." },

    // Jeremiah
    { book: "Jeremias", chapter: 29, verse: 11, text: "Pois sou eu que conheço os planos que tenho para vocês', diz o Senhor, 'planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro." },

    // 2 Timothy
    { book: "2 Timóteo", chapter: 1, verse: 7, text: "Pois Deus não nos deu espírito de covardia, mas de poder, de amor e de equilíbrio." },

    // Joshua
    { book: "Josué", chapter: 1, verse: 9, text: "Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar." },

    // Ephesians
    { book: "Efésios", chapter: 2, verse: 8, text: "Pois vocês são salvos pela graça, por meio da fé, e isto não vem de vocês, é dom de Deus;" },
    { book: "Efésios", chapter: 2, verse: 9, text: "não por obras, para que ninguém se glorie." },

    // James
    { book: "Tiago", chapter: 1, verse: 2, text: "Meus irmãos, considerem motivo de grande alegria o fato de passarem por diversas provações," },
    { book: "Tiago", chapter: 1, verse: 3, text: "pois vocês sabem que a prova da sua fé produz perseverança." },
    { book: "Tiago", chapter: 1, verse: 5, text: "Se algum de vocês tem falta de sabedoria, peça-a a Deus, que a todos dá livremente, de boa vontade; e lhe será concedida." },

    // 1 John
    { book: "1 João", chapter: 4, verse: 8, text: "Quem não ama não conhece a Deus, porque Deus é amor." },
    { book: "1 João", chapter: 4, verse: 18, text: "No amor não há medo; pelo contrário, o perfeito amor expulsa o medo, porque o medo supõe castigo. Aquele que tem medo não está aperfeiçoado no amor." },
    { book: "1 João", chapter: 4, verse: 19, text: "Nós amamos porque ele nos amou primeiro." },

    // Revelation
    { book: "Apocalipse", chapter: 21, verse: 4, text: "Ele enxugará dos seus olhos toda lágrima. Não haverá mais morte, nem tristeza, nem choro, nem dor, pois a antiga ordem já passou." },
  ];

  console.log(`Inserting ${sampleVerses.length} sample Bible verses...`);

  await prisma.bibleVerse.createMany({
    data: sampleVerses.map((v) => ({
      ...v,
      translation: "NVI",
    })),
    skipDuplicates: true,
  });

  console.log("Sample Bible verses inserted successfully!");
  console.log("Note: For production, import the full NVI Bible using the import-bible.ts script");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
