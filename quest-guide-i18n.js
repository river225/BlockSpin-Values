window.getQuestGuideData = function (lang) {
  var data = {
    en: {
      intro: "Quests are an easy way to earn money and valuable items as you progress through the game. You can find and track your available quests in your player sidebar. In total, completing all quests rewards you with $1,000 Cash, 100 XP, 6 Bottles, 15 Bricks, and 5 Molotovs. While these rewards may not be game-changing, they can provide a useful boost for new players by helping with combat and making it easier to purchase early-game items such as vehicles when money is harder to earn.",
      introStructure: {
        kicker: "Earn cash & items while you play",
        points: [
          {
            title: "What are quests?",
            text: "Quests are an easy way to earn money and valuable items as you progress through the game."
          },
          {
            title: "Where to find them",
            text: "You can find and track your available quests in your player sidebar."
          }
        ],
        rewards: {
          title: "Complete all quests",
          items: ["$1,000 Cash", "100 XP", "6 Bottles", "15 Bricks", "5 Molotovs"]
        },
        note: "While these rewards may not be game-changing, they can provide a useful boost for new players by helping with combat and making it easier to purchase early-game items such as vehicles when money is harder to earn."
      },
      wikiImage: "https://i.ibb.co/MyRfh0nf/Untitled-design-6.png",
      wikiAlt: "Quests button location in the game sidebar",
      categories: [
        {
          id: "playtime",
          title: "Playtime Quests",
          intro: "There are 3 Playtime Quests that are completed simply by playing the game. These quests start automatically as soon as you join.",
          quests: [
            { num: 1, title: "Play for 5 Minutes", reward: "100 Cash" },
            { num: 2, title: "Play for 10 Minutes", reward: "200 Cash" },
            { num: 3, title: "Join 5 days in a row", reward: "15 Bricks and 5 Molotovs" }
          ]
        },
        {
          id: "jobs",
          title: "Job Quests",
          intro: "These quests involve working at various jobs located around the map.",
          quests: [
            {
              num: 4,
              title: "Work 3 Different Jobs",
              reward: "100 XP",
              details: [
                "To complete this quest, you must work at 3 different jobs. The easiest jobs to use are Burger Place, Quick 11, and The Butcher's Cut.",
                "All job locations can be seen in the image below. To make them easier to find, each workplace has a unique icon displayed above it on the BlockSpin map."
              ],
              image: {
                src: "https://i.ibb.co/cS8HmrhB/Screenshot-2026-05-30-at-19-41-30.png",
                alt: "Burger Place, Quick 11, and The Butcher's Cut job locations"
              }
            },
            {
              num: 5,
              title: "Pro Skimmer",
              reward: "$175 Cash",
              details: [
                "To complete this quest, you must hack 5 ATMs located throughout various hotspots around the map. Before you can start hacking, you will need to purchase Hack Tools. These can be bought from Sam, who can be found behind Sam's Motel, near the Car Dealership."
              ],
              image: {
                src: "https://i.ibb.co/DDdqMXvr/Screenshot-2026-05-30-at-19-58-15.png",
                alt: "Sam behind Sam's Motel selling Basic Hack Tool"
              }
            },
            {
              num: 6,
              title: "Just Keep Mopping",
              reward: "$100 Cash",
              details: [
                "For this quest, get a job at the burger place and mop 10 puddles. The burger place can be found near the gun store."
              ]
            }
          ]
        },
        {
          id: "playthrough",
          title: "Playthrough Quests",
          intro: "These quests are naturally completed as you play the game. However, if you wish to earn the rewards sooner, you can focus on completing the required objectives to finish them faster.",
          quests: [
            {
              num: 7,
              title: "Glass Crackin'",
              reward: "$50 Cash and 5 Bottles",
              details: [
                "To complete this quest, you need to break windows around the map. The windows of all buildings regenerate approximately every minute, allowing you to continue making progress. For the fastest completion, it is recommended to walk through the neighborhood and break the windows of each house you pass until the objective is complete."
              ]
            },
            {
              num: 8,
              title: "Learner Driver",
              reward: "$100 Cash",
              details: [
                "To complete this quest, you simply need to drive any vehicle. This can be a vehicle you own or one belonging to another player. For the quickest completion if you do not own a vehicle, try entering vehicles owned by other players around the map. If the vehicles are locked, you can purchase a Lockpick from Sam, who is located behind Sam's Motel, and use it to gain access."
              ]
            },
            {
              num: 9,
              title: "Cash for Clutter",
              reward: "$100 Cash",
              details: [
                "To complete this quest, simply sell 3 items to Rick at the Pawn Shop. The Pawn Shop can be found near the Night Club, or you can locate it by following its icon displayed above the building. Once you have sold 3 items to Rick, the quest will be completed."
              ]
            },
            {
              num: 10,
              title: "Death by Distance",
              reward: "$175 Cash and 1 Bottle",
              details: [
                "To complete this quest, you must eliminate a player using a throwable item. Keep in mind that when a player is defeated, they enter a temporary paralyzed state where they can either be stomped to finish them off or carried to safety and allowed to recover. For this quest, the final blow must be dealt with a throwable while the player is in this downed state. The easiest method is to use a gun or melee weapon to damage a player until they become paralyzed, then finish them off with a throwable item. We recommend using Milkshakes from the Burger Place or Bottles from Quick 11, as they are inexpensive and easy to obtain."
              ],
              image: {
                src: "https://i.ibb.co/fdvrvmSh/Screenshot-2026-05-30-at-20-51-21.png",
                alt: "Player throwing a bottle at an opponent in a paralyzed state",
                compact: true
              }
            },
            {
              num: 11,
              title: "Bad Signal",
              reward: "$500 Cash",
              details: [
                "To complete this quest you need to shoot all satellite dishes around the map, the video below shows where each can be found."
              ],
              video: {
                platform: "tiktok",
                url: "https://www.tiktok.com/@river1_0_/video/7650535017994652951",
                videoId: "7650535017994652951",
                title: "Bad Signal quest — satellite dish locations"
              }
            }
          ]
        }
      ]
    },
    fr: {
      intro: "Les quêtes sont un moyen simple de gagner de l'argent et des objets précieux au fur et à mesure de votre progression dans le jeu. Vous pouvez trouver et suivre vos quêtes disponibles dans la barre latérale du joueur. Au total, compléter toutes les quêtes vous récompense avec 1 000 $ en espèces, 100 XP, 6 bouteilles, 15 briques et 5 cocktails Molotov. Bien que ces récompenses ne changent pas la donne, elles peuvent offrir un coup de pouce utile aux nouveaux joueurs en aidant au combat et en facilitant l'achat d'objets de début de partie, comme des véhicules, lorsque l'argent est plus difficile à gagner.",
      introStructure: {
        kicker: "Gagnez de l'argent et des objets en jouant",
        points: [
          {
            title: "Que sont les quêtes ?",
            text: "Les quêtes sont un moyen simple de gagner de l'argent et des objets précieux au fur et à mesure de votre progression."
          },
          {
            title: "Où les trouver",
            text: "Retrouvez et suivez vos quêtes disponibles dans la barre latérale du joueur."
          }
        ],
        rewards: {
          title: "Compléter toutes les quêtes",
          items: ["1 000 $ en espèces", "100 XP", "6 bouteilles", "15 briques", "5 cocktails Molotov"]
        },
        note: "Bien que ces récompenses ne changent pas la donne, elles peuvent offrir un coup de pouce utile aux nouveaux joueurs en aidant au combat et en facilitant l'achat d'objets de début de partie, comme des véhicules."
      },
      wikiImage: "https://i.ibb.co/MyRfh0nf/Untitled-design-6.png",
      wikiAlt: "Emplacement du bouton Quêtes dans la barre latérale du jeu",
      categories: [
        {
          id: "playtime",
          title: "Quêtes de temps de jeu",
          intro: "Il y a 3 quêtes de temps de jeu qui se complètent simplement en jouant. Ces quêtes démarrent automatiquement dès que vous rejoignez le jeu.",
          quests: [
            { num: 1, title: "Jouer pendant 5 minutes", reward: "100 $ en espèces" },
            { num: 2, title: "Jouer pendant 10 minutes", reward: "200 $ en espèces" },
            { num: 3, title: "Se connecter 5 jours d'affilée", reward: "15 briques et 5 cocktails Molotov" }
          ]
        },
        {
          id: "jobs",
          title: "Quêtes de travail",
          intro: "Ces quêtes consistent à travailler dans divers emplois situés sur la carte.",
          quests: [
            {
              num: 4,
              title: "Travailler dans 3 emplois différents",
              reward: "100 XP",
              details: [
                "Pour compléter cette quête, vous devez travailler dans 3 emplois différents. Les emplois les plus faciles à utiliser sont Burger Place, Quick 11 et The Butcher's Cut.",
                "Tous les emplacements de travail sont visibles sur l'image ci-dessous. Pour les repérer plus facilement, chaque lieu de travail possède une icône unique affichée au-dessus sur la carte BlockSpin."
              ],
              image: {
                src: "https://i.ibb.co/cS8HmrhB/Screenshot-2026-05-30-at-19-41-30.png",
                alt: "Emplacements des jobs Burger Place, Quick 11 et The Butcher's Cut"
              }
            },
            {
              num: 5,
              title: "Pro du piratage",
              reward: "175 $ en espèces",
              details: [
                "Pour compléter cette quête, vous devez pirater 5 distributeurs automatiques situés dans divers points chauds de la carte. Avant de commencer le piratage, vous devrez acheter des outils de piratage. Ils peuvent être achetés auprès de Sam, que l'on trouve derrière le Sam's Motel, près du concessionnaire automobile."
              ],
              image: {
                src: "https://i.ibb.co/DDdqMXvr/Screenshot-2026-05-30-at-19-58-15.png",
                alt: "Sam derrière le Sam's Motel vendant l'outil de piratage basique"
              }
            },
            {
              num: 6,
              title: "Continue de passer la serpillière",
              reward: "100 $ en espèces",
              details: [
                "Pour cette quête, obtenez un emploi au burger place et passez la serpillière sur 10 flaques. Le burger place se trouve près de l'armurerie."
              ]
            }
          ]
        },
        {
          id: "playthrough",
          title: "Quêtes de progression",
          intro: "Ces quêtes se complètent naturellement en jouant. Cependant, si vous souhaitez obtenir les récompenses plus tôt, vous pouvez vous concentrer sur les objectifs requis pour les terminer plus rapidement.",
          quests: [
            {
              num: 7,
              title: "Bris de verre",
              reward: "50 $ en espèces et 5 bouteilles",
              details: [
                "Pour compléter cette quête, vous devez casser des fenêtres sur la carte. Les fenêtres de tous les bâtiments se régénèrent environ toutes les minutes, ce qui vous permet de continuer à progresser. Pour une complétion la plus rapide, il est recommandé de parcourir le quartier et de casser les fenêtres de chaque maison que vous croisez jusqu'à ce que l'objectif soit atteint."
              ]
            },
            {
              num: 8,
              title: "Apprenti conducteur",
              reward: "100 $ en espèces",
              details: [
                "Pour compléter cette quête, il vous suffit de conduire n'importe quel véhicule. Il peut s'agir d'un véhicule qui vous appartient ou de celui d'un autre joueur. Pour terminer le plus rapidement si vous ne possédez pas de véhicule, essayez d'entrer dans les véhicules d'autres joueurs sur la carte. Si les véhicules sont verrouillés, vous pouvez acheter un crochet de serrurier auprès de Sam, situé derrière le Sam's Motel, et l'utiliser pour y accéder."
              ]
            },
            {
              num: 9,
              title: "Argent contre encombrement",
              reward: "100 $ en espèces",
              details: [
                "Pour compléter cette quête, vendez simplement 3 objets à Rick au prêteur sur gages. Le prêteur sur gages se trouve près de la boîte de nuit, ou vous pouvez le localiser en suivant son icône affichée au-dessus du bâtiment. Une fois que vous avez vendu 3 objets à Rick, la quête sera terminée."
              ]
            },
            {
              num: 10,
              title: "Mort à distance",
              reward: "175 $ en espèces et 1 bouteille",
              details: [
                "Pour compléter cette quête, vous devez éliminer un joueur à l'aide d'un objet lançable. Gardez à l'esprit que lorsqu'un joueur est vaincu, il entre dans un état paralysé temporaire où il peut soit être piétiné pour être achevé, soit transporté en sécurité et laissé se rétablir. Pour cette quête, le coup final doit être porté avec un objet lançable pendant que le joueur est dans cet état à terre. La méthode la plus simple consiste à utiliser une arme à feu ou une arme de mêlée pour blesser un joueur jusqu'à ce qu'il soit paralysé, puis de l'achever avec un objet lançable. Nous recommandons d'utiliser des milk-shakes du Burger Place ou des bouteilles de Quick 11, car ils sont bon marché et faciles à obtenir."
              ],
              image: {
                src: "https://i.ibb.co/fdvrvmSh/Screenshot-2026-05-30-at-20-51-21.png",
                alt: "Joueur lançant une bouteille sur un adversaire dans un état paralysé",
                compact: true
              }
            },
            {
              num: 11,
              title: "Mauvais signal",
              reward: "500 $ en espèces",
              details: [
                "Pour compléter cette quête, vous devez tirer sur toutes les antennes paraboliques de la carte ; la vidéo ci-dessous montre où chacune se trouve."
              ],
              video: {
                platform: "tiktok",
                url: "https://www.tiktok.com/@river1_0_/video/7650535017994652951",
                videoId: "7650535017994652951",
                title: "Quête Mauvais signal — emplacements des antennes paraboliques"
              }
            }
          ]
        }
      ]
    },
    es: {
      intro: "Las misiones son una forma sencilla de ganar dinero y objetos valiosos a medida que avanzas en el juego. Puedes encontrar y seguir tus misiones disponibles en la barra lateral del jugador. En total, completar todas las misiones te recompensa con $1,000 en efectivo, 100 XP, 6 botellas, 15 ladrillos y 5 cócteles Molotov. Aunque estas recompensas no cambian el juego por completo, pueden ofrecer un impulso útil a los jugadores nuevos al ayudar en combate y facilitar la compra de objetos de inicio, como vehículos, cuando el dinero cuesta más ganar.",
      introStructure: {
        kicker: "Gana dinero y objetos mientras juegas",
        points: [
          {
            title: "¿Qué son las misiones?",
            text: "Las misiones son una forma sencilla de ganar dinero y objetos valiosos a medida que avanzas en el juego."
          },
          {
            title: "Dónde encontrarlas",
            text: "Puedes encontrar y seguir tus misiones disponibles en la barra lateral del jugador."
          }
        ],
        rewards: {
          title: "Completar todas las misiones",
          items: ["$1,000 en efectivo", "100 XP", "6 botellas", "15 ladrillos", "5 cócteles Molotov"]
        },
        note: "Aunque estas recompensas no cambian el juego por completo, pueden ofrecer un impulso útil a los jugadores nuevos al ayudar en combate y facilitar la compra de objetos de inicio, como vehículos."
      },
      wikiImage: "https://i.ibb.co/MyRfh0nf/Untitled-design-6.png",
      wikiAlt: "Ubicación del botón de misiones en la barra lateral del juego",
      categories: [
        {
          id: "playtime",
          title: "Misiones de tiempo de juego",
          intro: "Hay 3 misiones de tiempo de juego que se completan simplemente jugando. Estas misiones comienzan automáticamente en cuanto te unes.",
          quests: [
            { num: 1, title: "Jugar durante 5 minutos", reward: "100 $ en efectivo" },
            { num: 2, title: "Jugar durante 10 minutos", reward: "200 $ en efectivo" },
            { num: 3, title: "Unirte 5 días seguidos", reward: "15 ladrillos y 5 cócteles Molotov" }
          ]
        },
        {
          id: "jobs",
          title: "Misiones de trabajo",
          intro: "Estas misiones implican trabajar en varios empleos ubicados alrededor del mapa.",
          quests: [
            {
              num: 4,
              title: "Trabajar en 3 empleos diferentes",
              reward: "100 XP",
              details: [
                "Para completar esta misión, debes trabajar en 3 empleos diferentes. Los empleos más fáciles de usar son Burger Place, Quick 11 y The Butcher's Cut.",
                "Todas las ubicaciones de trabajo se pueden ver en la imagen de abajo. Para encontrarlas más fácilmente, cada lugar de trabajo tiene un icono único mostrado encima en el mapa de BlockSpin."
              ],
              image: {
                src: "https://i.ibb.co/cS8HmrhB/Screenshot-2026-05-30-at-19-41-30.png",
                alt: "Ubicaciones de los empleos Burger Place, Quick 11 y The Butcher's Cut"
              }
            },
            {
              num: 5,
              title: "Pro del hackeo",
              reward: "$175 en efectivo",
              details: [
                "Para completar esta misión, debes hackear 5 cajeros automáticos ubicados en varios puntos calientes del mapa. Antes de comenzar a hackear, necesitarás comprar herramientas de hackeo. Pueden comprarse a Sam, quien se encuentra detrás del Sam's Motel, cerca del concesionario de autos."
              ],
              image: {
                src: "https://i.ibb.co/DDdqMXvr/Screenshot-2026-05-30-at-19-58-15.png",
                alt: "Sam detrás del Sam's Motel vendiendo la herramienta de hackeo básica"
              }
            },
            {
              num: 6,
              title: "Sigue trapeando",
              reward: "$100 en efectivo",
              details: [
                "Para esta misión, consigue un empleo en el burger place y trapea 10 charcos. El burger place se encuentra cerca de la tienda de armas."
              ]
            }
          ]
        },
        {
          id: "playthrough",
          title: "Misiones de progresión",
          intro: "Estas misiones se completan de forma natural mientras juegas. Sin embargo, si deseas obtener las recompensas antes, puedes concentrarte en completar los objetivos requeridos para terminarlas más rápido.",
          quests: [
            {
              num: 7,
              title: "Rompiendo cristales",
              reward: "$50 en efectivo y 5 botellas",
              details: [
                "Para completar esta misión, necesitas romper ventanas alrededor del mapa. Las ventanas de todos los edificios se regeneran aproximadamente cada minuto, lo que te permite seguir progresando. Para completarla lo más rápido posible, se recomienda caminar por el vecindario y romper las ventanas de cada casa que pases hasta que se complete el objetivo."
              ]
            },
            {
              num: 8,
              title: "Conductor principiante",
              reward: "$100 en efectivo",
              details: [
                "Para completar esta misión, simplemente necesitas conducir cualquier vehículo. Puede ser un vehículo tuyo o de otro jugador. Para completarla lo más rápido si no tienes un vehículo, intenta entrar en vehículos de otros jugadores alrededor del mapa. Si los vehículos están bloqueados, puedes comprar una ganzúa a Sam, ubicado detrás del Sam's Motel, y usarla para acceder."
              ]
            },
            {
              num: 9,
              title: "Efectivo por trastos",
              reward: "$100 en efectivo",
              details: [
                "Para completar esta misión, simplemente vende 3 objetos a Rick en la casa de empeños. La casa de empeños se encuentra cerca de la discoteca, o puedes localizarla siguiendo su icono mostrado encima del edificio. Una vez que hayas vendido 3 objetos a Rick, la misión se completará."
              ]
            },
            {
              num: 10,
              title: "Muerte a distancia",
              reward: "$175 en efectivo y 1 botella",
              details: [
                "Para completar esta misión, debes eliminar a un jugador usando un objeto arrojadizo. Ten en cuenta que cuando un jugador es derrotado, entra en un estado paralizado temporal donde puede ser pisoteado para rematarlo o llevado a un lugar seguro y dejado recuperarse. Para esta misión, el golpe final debe darse con un objeto arrojadizo mientras el jugador está en este estado caído. El método más fácil es usar un arma de fuego o un arma cuerpo a cuerpo para dañar a un jugador hasta que quede paralizado, y luego rematarlo con un objeto arrojadizo. Recomendamos usar batidos del Burger Place o botellas de Quick 11, ya que son baratos y fáciles de obtener."
              ],
              image: {
                src: "https://i.ibb.co/fdvrvmSh/Screenshot-2026-05-30-at-20-51-21.png",
                alt: "Jugador lanzando una botella a un oponente en estado paralizado",
                compact: true
              }
            },
            {
              num: 11,
              title: "Mala señal",
              reward: "$500 en efectivo",
              details: [
                "Para completar esta misión necesitas disparar a todas las antenas parabólicas del mapa; el video de abajo muestra dónde se encuentra cada una."
              ],
              video: {
                platform: "tiktok",
                url: "https://www.tiktok.com/@river1_0_/video/7650535017994652951",
                videoId: "7650535017994652951",
                title: "Misión Mala señal — ubicaciones de las antenas parabólicas"
              }
            }
          ]
        }
      ]
    }
  };

  return data[lang] || data.en;
};
