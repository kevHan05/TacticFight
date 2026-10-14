// Story and dialogue: backstories, pre-fight banter and per-fighter campaigns.
//
// Every line is [speakerId, text]. speakerId is a roster id or "narrator".
// banter keys are "a>b": a = the player's fighter, b = the opponent.
// The thread that ties the campaigns together: a hooded fortune teller with a
// tiny "$1 PROPHECIES" wagon turns up at every venue of the Grand Brawl. That is
// PROPHET. His prophecies are always correct and always useless. He only steps
// into the ring when a prophecy says he wins, throws off the cloak, and is the
// last opponent of every other campaign. He has no mouth, so his lines stay short.
const STORY = {
  backstories: {
    rook: "Rook grew up on the rooftops of the Neon District, learning to fight from arcade cabinets and a grumpy noodle chef who charged him per lesson. He invented the Blaze Ball by accident while lighting a barbecue; the grill still has a Rook-shaped hole in it. He is loud, cocky and has never lost on his own street, mostly because he counts home losses as 'practice'. He has never thrown a cheap shot, or paid full price for noodles.",
    byte: "Byte is Combat Unit 7 of a series built to manage server cooling, until a firmware update installed 'competitive mode' by mistake. It now publishes patch notes after every punch, and it nerfed its own sense of humour to zero, citing balance concerns. Byte is 99.8% confident it is always right; the other 0.2% is under investigation. Its greatest fear is being turned off and on again.",
    bobbie: "Bobbie Macalanger grew up in a neighbourhood where respect was earned, and his temper earned him a lot of detention. His grandfather put gloves on him at Macalanger Gym, where he learned discipline, footwork and when not to throw a punch (rarely). He has given a nickname to every person, pet and vending machine on his block. He still coaches the local kids for free, and he has never used an indoor voice, because he insists he wasn't issued one.",
    rocky: "R.O.C.K.Y was built in Lab 7 as a security robot and declared a failure because he kept protecting innocent people instead of following orders. His horn upgrade worked a little too well: he charged through three walls, a vending machine and the staff party, then out of the lab. Street performers named him, and he kept it because it sounded STRUCTURALLY IMPRESSIVE. He is searching for his creators, and for what it means to have a heart. Current progress: 41%.",
    ninja: "Ninja Main grew up on old martial arts movies, ninja toys and dramatic poses in the bedroom mirror. His first smoke bomb set off every alarm in his building, and his first stealth mission was announced by his mum over the intercom. In a hidden dojo he found an ancient scroll and decided it was his destiny; the last page is a takeaway menu, and he has memorised that too. He is not a master yet. But you have seen only 1% of his potential.",
    zoombie: "He was a safari guide who talked to animals like old friends, until a leaky container at a night safari research station left him green, clumsy and completely pulse-free. He still works the night shift there, as the only undead zookeeper and researcher on staff. He protects the wildlife, eats the fruit nobody else wants and checks his pulse every hour, just in case it came back. The animals adore him. The tourists scream, which he assumes is a greeting.",
    bananas: "BANANAS was an ordinary orange in a grocery store until a boy stole him, glued on googly eyes, drew a mouth with a marker and gave him two little legs. The boy named him BANANAS, the funniest word he knew. On a school trip to Lab 7, the boy found an unlabelled syringe in a glass case, with a sticky note saying 'Experimental Growth Serum #9', and injected the orange. The eyes and mouth turned real, BANANAS grew to human size, yelled his own name and ran away. He still has no arms. NO ARMS, NO PROBLEM!",
    prophet: "PROPHET runs a tiny traveling wagon with a striped canopy, a crystal ball and a hand-painted sign: '$1 PROPHECIES'. Nobody has seen his face, only two glowing eyes inside a dark hood; guesses include a raccoon, three raccoons, and more hood. His prophecies are always correct and always useless: 'You will be punched. Soon.' 'A great hunger approaches. It is lunch.' The booth has 1.2 stars, and every review says 'technically accurate'. He has never given a refund. He saw them coming. He only fights when a prophecy says he will win."
  },

  banter: {
    "rook>byte": [
      ["byte", "Scanning: Rook. Patch 4.2 notes: 'Rook talks too much.' Status: won't fix."],
      ["rook", "That's not a bug, tin can. That's a feature. Ask anyone in the Neon District."],
      ["byte", "I asked. 61% said 'who?' The other 39% was the noodle chef."]
    ],
    "rook>bobbie": [
      ["bobbie", "Ayy, HEADBAND! Nice red pajamas! Step into my ring, let's see what you got!"],
      ["rook", "Pajamas? This gi has seen more fights than your sneakers have seen sidewalk."],
      ["bobbie", "These kicks are limited edition, HEADBAND. After tonight, so is your streak!"]
    ],
    "rook>rocky": [
      ["rocky", "THREAT DETECTED. HORNS ACTIVATED."],
      ["rook", "Easy, big guy. I want a fight, not a new hole in my gi."],
      ["rocky", "CALCULATING... YOUR GI HAS ZERO HOLES. I WILL AIM FOR A TASTEFUL ONE."],
      ["rook", "Weirdly polite threat. I respect it."]
    ],
    "rook>ninja": [
      ["ninja", "You cannot see me. I am one with the shadows."],
      ["rook", "You're under a streetlight. Waving. And your mask has your name sewn in it."],
      ["ninja", "...My mum labels my laundry. That was only 1% of my stealth!"]
    ],
    "rook>zoombie": [
      ["zoombie", "Brains? Nah... got any bananas? Wait, is that a pigeon? Hi, pigeon!"],
      ["rook", "Focus, ZOO-mbie. The pigeon isn't fighting you. I am."],
      ["zoombie", "Shame. The pigeon looks tougher. Hold on, checking my pulse... nope, still out."]
    ],
    "rook>bananas": [
      ["bananas", "BANANAS HAS ARRIVED! Prepare to be squeezed, headband man!"],
      ["rook", "You're an orange named BANANAS. With no arms. How do you even fight?"],
      ["bananas", "NO ARMS, NO PROBLEM! BANANAS kicks. Also bounces. Mostly bounces."],
      ["rook", "Fine. But if you get juice on my gi, you're paying for the dry cleaning."]
    ],
    "rook>prophet": [
      ["prophet", "Rook. I foresee... a headband."],
      ["rook", "I'm wearing it. You're looking at it. That's not a prophecy, that's eyes."],
      ["prophet", "And yet it came true. One dollar."]
    ],

    "byte>rook": [
      ["rook", "Byte! Back for another beating on my street? You remember last time."],
      ["byte", "I remember everything. Last time you slipped on a noodle. I have it in 4K."],
      ["rook", "That was a tactical noodle. Let's go."]
    ],
    "byte>bobbie": [
      ["bobbie", "Look who rolled in! TOASTER! You charging up, or just warming bread?"],
      ["byte", "Correction: Combat Unit 7. Toasting was removed in patch 2.0. Too powerful."],
      ["bobbie", "HA! Then let's see if you still crumble!"]
    ],
    "byte>rocky": [
      ["rocky", "GREETINGS, FELLOW ROBOT. DO YOU ALSO ENJOY HUGS?"],
      ["byte", "Negative. Hugs were deprecated in version 1.3. Please file a feature request."],
      ["rocky", "FILING NOW. ALSO FILING A HORN-SHAPED REQUEST TO YOUR CHEST."]
    ],
    "byte>ninja": [
      ["ninja", "Behold! You cannot predict me, robot! I am chaos itself!"],
      ["byte", "Prediction: you will announce your next move out loud before using it."],
      ["ninja", "Ha! Wrong! Next I will use... Rookie Shuriken. ...Oh no."]
    ],
    "byte>zoombie": [
      ["zoombie", "Ooh, a robot! Do robots count as wildlife? Can I tag your ear?"],
      ["byte", "I have no ears. I have a cooling fan. Do not tag the cooling fan."],
      ["zoombie", "Too late. Your name is Gerald now. Hi, Gerald."]
    ],
    "byte>bananas": [
      ["bananas", "A robot! Quick, scan BANANAS! What is BANANAS made of?"],
      ["byte", "Result: 87% water, 13% confidence. Classification: citrus, unstable."],
      ["bananas", "BANANAS is MOSTLY confidence! Your scanner needs a patch!"]
    ],
    "byte>prophet": [
      ["prophet", "Combat Unit 7. I foresee that you will be updated."],
      ["byte", "Every device gets updated. That prophecy is 100% accurate and 0% useful."],
      ["prophet", "Correct. No refunds."]
    ],

    "bobbie>rook": [
      ["rook", "Welcome to the Neon District, Bobbie. Wipe your sneakers."],
      ["bobbie", "HEADBAND! You run this whole street? Even the creepy hood guy with the booth?"],
      ["rook", "Okay, not that guy. Nobody runs that guy. Let's fight before he looks over."]
    ],
    "bobbie>byte": [
      ["byte", "Bobbie Macalanger. Punch power: high. Indoor voice: not found."],
      ["bobbie", "I DON'T NEED an indoor voice, CALCULATOR! Step into my ring!"],
      ["byte", "This is a data centre. It is my ring. You stepped into it. Very loudly."]
    ],
    "bobbie>rocky": [
      ["rocky", "HUMAN WITH LARGE HAIR DETECTED. IS IT A HELMET?"],
      ["bobbie", "This afro is a NATURAL WONDER, BIG BULL! Hands off!"],
      ["rocky", "NOTED. HORNS WILL AVOID THE HAIR. FISTS HAVE NOT AGREED YET."]
    ],
    "bobbie>ninja": [
      ["ninja", "Prepare yourself! I have trained for this moment for three whole weeks!"],
      ["bobbie", "Three weeks? I got socks older than that, NINJA NOODLE!"],
      ["ninja", "Ninja Noodle... I hate that I love it."]
    ],
    "bobbie>zoombie": [
      ["zoombie", "Hold still, your hair might have birds in it. Can I check for birds?"],
      ["bobbie", "No birds in the 'fro, GREEN BEAN! Just pure style!"],
      ["zoombie", "Shame. Birds love a good afro. So do I. Respectfully."]
    ],
    "bobbie>bananas": [
      ["bananas", "Big hair man! BANANAS challenges you to a box-off!"],
      ["bobbie", "How you gonna box with no fists, LIL' VITAMIN C?"],
      ["bananas", "WITH MY FEET, OBVIOUSLY! NO ARMS, NO PROBLEM!"],
      ["bobbie", "HA! I like this kid! After the fight, I'm training you!"]
    ],
    "bobbie>prophet": [
      ["prophet", "Bobbie. I foresee a loud noise."],
      ["bobbie", "That's ME, HOODIE! I'm the loud noise! Every single day!"],
      ["prophet", "Easiest dollar I ever made."]
    ],

    "rocky>rook": [
      ["rook", "First a creepy hood booth on my corner, now a robot bull. Is it parade day?"],
      ["rocky", "I AM NOT A PARADE. I AM ONE BULL. I CONTAIN ZERO FLOATS."],
      ["rook", "One bull, zero floats, one problem. Bring it."]
    ],
    "rocky>byte": [
      ["byte", "R.O.C.K.Y. Lab 7 unit. Known issue: protects people instead of servers."],
      ["rocky", "THAT IS NOT A BUG. THAT IS MY HEART. I HAVE APPROXIMATELY 41% OF ONE."],
      ["byte", "41% is higher than my estimate. Updating respect. Updating fists."]
    ],
    "rocky>bobbie": [
      ["bobbie", "Look at this! BIG BULL in my gym! You lift, bro?"],
      ["rocky", "I LIFT 4.2 TONNES. ALSO, ONCE, A SMALL CAT OUT OF A TREE."],
      ["bobbie", "That's the sweetest flex I ever heard. Let's GO!"]
    ],
    "rocky>ninja": [
      ["rocky", "SCANNING DOJO... 14 SHURIKEN IN THE CEILING. 0 IN THE TARGETS."],
      ["ninja", "The ceiling IS the target! It attacked me first!"],
      ["rocky", "THE CEILING IS INNOCENT. I WILL PROTECT IT."]
    ],
    "rocky>zoombie": [
      ["zoombie", "A metal bull! A new species! Hold still, I'm sketching you."],
      ["rocky", "I AM NOT A SPECIES. I AM A PROTOTYPE. PLEASE DRAW MY GOOD SIDE."],
      ["zoombie", "Which side's the good one? ...They both have horns. Love it."]
    ],
    "rocky>bananas": [
      ["bananas", "Bull robot! Scan BANANAS! Is BANANAS cool?"],
      ["rocky", "SCANNING... FRIENDLY FRUIT. HIGH CHAOS POTENTIAL."],
      ["bananas", "BANANAS will put that on a T-shirt! If BANANAS ever gets arms!"]
    ],
    "rocky>prophet": [
      ["prophet", "Robot. I foresee you will ask for a refund."],
      ["rocky", "I HAVE NOT PAID YOU. CALCULATING REFUND... ZERO DOLLARS."],
      ["prophet", "Denied."]
    ],

    "ninja>rook": [
      ["rook", "A ninja on my street? Bold. We have streetlights here."],
      ["ninja", "Streetlights are no match for my Smoke Panic! Behold!"],
      ["rook", "That's steam from the noodle stand."],
      ["ninja", "...Then behold the noodle steam! It is my ally!"]
    ],
    "ninja>byte": [
      ["byte", "Ninja Main. Stealth rating: 3%. Volume rating: 97%."],
      ["ninja", "You have seen only 1% of my ninja potential! ...Wait, that's less."],
      ["byte", "Correct. Patch notes recommend 'more percent'."]
    ],
    "ninja>bobbie": [
      ["bobbie", "NINJA! In MY gym! You here to learn real fighting, SHURIKEN SHORTY?"],
      ["ninja", "I came to study your footwork. Secretly. Please pretend I'm not here."],
      ["bobbie", "Kid, you're standing in the middle of my ring holding a notebook."]
    ],
    "ninja>rocky": [
      ["rocky", "INTRUDER DETECTED IN LAB 7. INTRUDER IS... POSING?"],
      ["ninja", "It is the Crane-Who-Waits! It means I am about to strike!"],
      ["rocky", "THE CRANE HAS WAITED FOR 40 SECONDS. I AM CONCERNED FOR ITS LEGS."]
    ],
    "ninja>zoombie": [
      ["zoombie", "Shh. There's an owl. Look, an owl! Oh, and a ninja, I guess."],
      ["ninja", "You noticed the owl BEFORE me? I'm the stealthy one here!"],
      ["zoombie", "The owl's stealthier. Also, you're standing on my lunch. It's a mango."]
    ],
    "ninja>bananas": [
      ["bananas", "Ninja! Teach BANANAS your silent technique!"],
      ["ninja", "First lesson: no bouncing. Second lesson: why are you still bouncing?"],
      ["bananas", "Silent bouncing! A BANANAS original! Write it down!"],
      ["ninja", "I am NOT writing it down. ...How do you spell 'boing'?"]
    ],
    "ninja>prophet": [
      ["prophet", "Ninja. I foresee you will strike a pose."],
      ["ninja", "Wrong! I will strike YOU! With the Pose of the Thunder Crane!"],
      ["prophet", "That is a pose."]
    ],

    "zoombie>rook": [
      ["rook", "ZOO-mbie! Welcome to my street. Careful, the pigeons here are mean."],
      ["zoombie", "Pigeons! Where? Are they nesting? Can I name one Doug?"],
      ["rook", "Name all of them. After I win."]
    ],
    "zoombie>byte": [
      ["byte", "ZOO-mbie. Heartbeat: none. Snack frequency: alarming."],
      ["zoombie", "No heartbeat? ...Huh. I keep meaning to report that missing."],
      ["byte", "Noted. Filing your pulse under 'lost and found'. Again."]
    ],
    "zoombie>bobbie": [
      ["bobbie", "GREEN MACHINE! You look tired, man. You sleeping okay?"],
      ["zoombie", "I've been dead for two years. Still tired. Is that normal?"],
      ["bobbie", "Not even a little! Let's get some cardio in you!"]
    ],
    "zoombie>rocky": [
      ["rocky", "ZOMBIE DETECTED. ADVICE: DO NOT EAT MY BRAIN. I DO NOT HAVE ONE."],
      ["zoombie", "Good, I don't want one. Got any bananas? Or bolts shaped like bananas?"],
      ["rocky", "I HAVE ONE YELLOW WARNING LABEL. IT IS NOT FOR EATING."]
    ],
    "zoombie>ninja": [
      ["ninja", "Prepare yourself, undead one! My shuriken never miss!"],
      ["zoombie", "Your last three are stuck in a tree. A squirrel uses one as a plate."],
      ["ninja", "...Then they never miss the TREE! Destiny!"]
    ],
    "zoombie>bananas": [
      ["bananas", "Zombie friend! BANANAS is here!"],
      ["zoombie", "A banana! Finally! ...Wait. Round. Orange. That's citrus. I've been lied to."],
      ["bananas", "BANANAS is a name, not a lifestyle!"]
    ],
    "zoombie>prophet": [
      ["prophet", "Zombie. I foresee you will check your pulse."],
      ["zoombie", "Ha! Not even close. ...Hold on, quick check. ...Nope, still gone."],
      ["prophet", "Foreseen."]
    ],

    "bananas>rook": [
      ["rook", "An orange on my street? You lost, buddy? The fruit stand's that way."],
      ["bananas", "BANANAS is not lost! BANANAS is EXPLORING with GREAT CONFIDENCE!"],
      ["rook", "That's what lost means. But respect."]
    ],
    "bananas>byte": [
      ["byte", "Object detected: orange. Name tag: BANANAS. Error: name does not compute."],
      ["bananas", "BANANAS is a premium name! You need a patch!"],
      ["byte", "Patch 7.1: 'Fruit names are now chaos.' Ugh. Deploying fists."]
    ],
    "bananas>bobbie": [
      ["bobbie", "SMOOTHIE! You came to my gym! Respect!"],
      ["bananas", "BANANAS wants to box! Give BANANAS gloves!"],
      ["bobbie", "Where would they even go? ...Okay, gloves on the feet. Let's GO!"]
    ],
    "bananas>rocky": [
      ["rocky", "LAB 7 RECORDS SHOW ONE MISSING SERUM. ALSO ONE MISSING ORANGE."],
      ["bananas", "BANANAS knows nothing! BANANAS was never here! BANANAS has to go!"],
      ["rocky", "THE DOOR IS BEHIND ME. I AM VERY WIDE."]
    ],
    "bananas>ninja": [
      ["ninja", "Halt! Ninjas wear black! You are VERY orange!"],
      ["bananas", "BANANAS is a SUNSET ninja! Sunset ninjas are orange!"],
      ["ninja", "...Sunset ninjas. Why didn't I think of that? Begin!"]
    ],
    "bananas>zoombie": [
      ["zoombie", "Shh. The giraffes are asleep. ...Oh, hello, tiny loud orange."],
      ["bananas", "BANANAS IS HUMAN-SIZED! ...BANANAS will whisper. bananas is human-sized."],
      ["zoombie", "Small. Round. Loud. Possibly edible. Definitely friend."]
    ],
    "bananas>prophet": [
      ["prophet", "Orange. I foresee a peel in your future."],
      ["bananas", "That's not a prophecy, that's just how oranges work!"],
      ["prophet", "One dollar."],
      ["bananas", "BANANAS has no pockets! Or arms! NO ARMS, NO DOLLAR!"]
    ],

    "prophet>rook": [
      ["rook", "Hey, creepy hood guy. Your booth's on my street. Read my fortune."],
      ["prophet", "You will win."],
      ["rook", "YES! Wait. Win what? When?"],
      ["prophet", "Something. Eventually."]
    ],
    "prophet>byte": [
      ["byte", "PROPHET. Booth rating: 1.2 stars. Top review: 'Said I'd blink. I blinked.'"],
      ["prophet", "Accurate."],
      ["byte", "Accurate is not the same as useful. The patch notes agree."]
    ],
    "prophet>bobbie": [
      ["bobbie", "HOODIE! Finally in my ring! Let's see that face!"],
      ["prophet", "No."],
      ["bobbie", "Just a peek! I got a nickname ready! It's HOODIE! ...It's still HOODIE."]
    ],
    "prophet>rocky": [
      ["rocky", "SCANNING HOOD... ERROR. HOOD TOO DARK. I SEE TWO EYES AND A MYSTERY."],
      ["prophet", "You see enough."],
      ["rocky", "I DO NOT. I WILL NEED A FLASHLIGHT. AND A LADDER."]
    ],
    "prophet>ninja": [
      ["ninja", "A hooded figure! Master! Teach me your mysterious ways!"],
      ["prophet", "Step one: buy a hood."],
      ["ninja", "I HAVE a hood! ...Okay, step two?"],
      ["prophet", "One dollar."]
    ],
    "prophet>zoombie": [
      ["zoombie", "Ooh, glowing eyes in the dark! Are you an owl? A very tall owl?"],
      ["prophet", "I am not an owl."],
      ["zoombie", "That's exactly what a tall owl would say. Hoo hoo?"]
    ],
    "prophet>bananas": [
      ["bananas", "Hood man! Tell BANANAS's fortune! Is it amazing?"],
      ["prophet", "You will roll somewhere."],
      ["bananas", "BANANAS ALWAYS rolls somewhere! You're SO good at this!"]
    ]
  },

  campaign: {
    rook: {
      title: "District Defender",
      intro: [
        ["narrator", "Neon District. Posters on every lamppost: 'THE GRAND BRAWL. Beat everyone.'"],
        ["narrator", "Under one sits a tiny wagon. Sign: '$1 PROPHECIES'. Two eyes glow in a dark hood."],
        ["rook", "A tournament? Easy. And hey, hood guy, quit staring. It's weird."]
      ],
      order: ["ninja", "zoombie", "rocky", "bobbie", "byte", "bananas", "prophet"],
      fights: {
        ninja: {
          before: [
            ["narrator", "A hidden dojo behind the market. Fourteen paper lanterns. Twelve are on fire."],
            ["ninja", "Rook! You found my dojo! Impossible! It is hidden!"],
            ["rook", "You gave me directions. Twice. Then you drew me a map."],
            ["ninja", "...A true ninja is a good host. Now prepare yourself!"]
          ],
          after: [
            ["ninja", "You beat 1% of my ninja potential. The other 99% had a cold."],
            ["rook", "Tell the other 99% to get well soon."]
          ]
        },
        zoombie: {
          before: [
            ["narrator", "The night safari. Crickets chirp. Somewhere, a hippo yawns like a tuba."],
            ["zoombie", "Rook! Shh. Keep it down, the flamingos are on a date."],
            ["rook", "I came to fight, not to babysit a flamingo date."],
            ["zoombie", "Fine. But if they stare, you lose a point. Flamingo rules."]
          ],
          after: [
            ["zoombie", "You won. The flamingos give it a 7. Tough crowd."]
          ]
        },
        rocky: {
          before: [
            ["narrator", "Lab 7. Three walls have bull-shaped holes. The fourth wall looks nervous."],
            ["rocky", "ROOK. YOUR WIN RATE IS 100% AT HOME. THIS IS NOT YOUR HOME."],
            ["rook", "Everywhere's my home. I'm that charming."],
            ["rocky", "CALCULATING CHARM... RESULT: LOUD. FIGHT MODE ENGAGED."]
          ],
          after: [
            ["rocky", "DEFEAT CONFIRMED. I WILL REPAIR THE WALL. AND MY FEELINGS."]
          ]
        },
        bobbie: {
          before: [
            ["narrator", "Macalanger Gym. It smells of sweat, leather and one heroic air freshener."],
            ["bobbie", "HEADBAND! You made the big leagues! My gym, my rules!"],
            ["rook", "And what are your rules?"],
            ["bobbie", "Rule one: be LOUD! Rule two: see rule one! STEP INTO MY RING!"]
          ],
          after: [
            ["bobbie", "Ayy, respect, HEADBAND! You hit like a Monday morning!"]
          ]
        },
        byte: {
          before: [
            ["narrator", "The data centre. Ten thousand fans hum. None of them are cheering."],
            ["byte", "Rook. I analysed 4,000 of your fights. You always open with a punch."],
            ["rook", "Then let's make it 4,001."],
            ["byte", "Prediction confirmed. Defence patch applied. ...Please punch slower."]
          ],
          after: [
            ["byte", "Loss logged. Patch notes: 'Rook still punches first. Working as intended.'"]
          ]
        },
        bananas: {
          before: [
            ["narrator", "Fruit Aisle 7. A sign says 'NO BOUNCING'. It has a bounce-shaped dent in it."],
            ["bananas", "BANANAS HAS ARRIVED! Welcome to BANANAS's home aisle!"],
            ["rook", "You live in the fruit aisle?"],
            ["bananas", "BANANAS lives EVERYWHERE! But mostly next to the grapes. They're quiet."]
          ],
          after: [
            ["bananas", "BANANAS lost! But BANANAS is still the roundest fighter! Undefeated at round!"]
          ]
        },
        prophet: {
          before: [
            ["narrator", "A misty crossroads at midnight. The little wagon creaks. Its lanterns sway."],
            ["rook", "Hood guy. You've been at every single one of my fights. What do you want?"],
            ["prophet", "It is written: PROPHET wins tonight."],
            ["narrator", "He throws off the cloak: a floating galaxy, a blazing halo, two furious eyes."],
            ["rook", "Whoa. Nice halo. Gonna punch it anyway."]
          ],
          after: [
            ["rook", "So much for 'PROPHET wins'."],
            ["prophet", "I reread the scroll. It says 'PROPHET WHINES'. The ink ran."]
          ]
        }
      },
      ending: [
        ["narrator", "Neon District, dawn. The Grand Brawl trophy sits on the noodle stand counter."],
        ["rook", "Undefeated at home. And away. And at a creepy crossroads. Easy."],
        ["narrator", "Tucked under the trophy is a little card: 'You will eat noodles. Soon. -P'"],
        ["rook", "...Okay. That one was actually helpful."]
      ]
    },

    byte: {
      title: "Patch Day",
      intro: [
        ["narrator", "Server Room B. Byte's fan spins at 7,000 RPM. A Grand Brawl flyer jams its printer."],
        ["byte", "Tournament detected. Win probability: 99.8%. The other 0.2% is a rounding error."],
        ["narrator", "Outside, a hooded fortune teller writes on a card: 'The robot will print things.'"]
      ],
      order: ["bobbie", "ninja", "bananas", "zoombie", "rook", "rocky", "prophet"],
      fights: {
        bobbie: {
          before: [
            ["narrator", "Macalanger Gym. Byte's sensors measure 92 decibels. All of them are Bobbie."],
            ["bobbie", "CALCULATOR! You came all the way out here! Gonna crunch some numbers?"],
            ["byte", "I am going to crunch you. Then the numbers. In that order."],
            ["bobbie", "HA! Put 'em up! You got hands? ...You got hands. Good."]
          ],
          after: [
            ["byte", "Victory. Patch notes: 'Bobbie volume reduced by 0%. Could not be fixed.'"]
          ]
        },
        ninja: {
          before: [
            ["narrator", "The hidden dojo. Byte located it in 0.3 seconds. It has a welcome mat."],
            ["ninja", "Robot! Your sensors cannot track my Almost Invisible technique!"],
            ["byte", "I tracked your heat signature, your footsteps and the bell on your shoe."],
            ["ninja", "...The bell is for luck. FIGHT!"]
          ],
          after: [
            ["ninja", "You defeated only 1% of my potential!"],
            ["byte", "Then I will schedule the other 99% for Tuesday."]
          ]
        },
        bananas: {
          before: [
            ["narrator", "Fruit Aisle 7. The barcode scanners beep in nervous harmony."],
            ["bananas", "A robot! BANANAS loves robots! Scan BANANAS! Go on!"],
            ["byte", "Scanning... Price: 59 cents. Discounted. Reason: 'too loud'."],
            ["bananas", "DISCOUNTED?! BANANAS IS PRICELESS! FIGHT!"]
          ],
          after: [
            ["bananas", "BANANAS lost... but BANANAS is still on sale, so that's nice."]
          ]
        },
        zoombie: {
          before: [
            ["narrator", "The night safari. A lemur steals one of Byte's screws and runs off with it."],
            ["zoombie", "Don't mind Larry, he collects shiny stuff. And bananas. Mostly bananas."],
            ["byte", "Requesting return of screw. Also, why is your pulse reading zero?"],
            ["zoombie", "Zero? Let me check. ...Yep, zero. Must be a slow day."]
          ],
          after: [
            ["zoombie", "You won! Larry's keeping the screw, though. Finders keepers."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District. A noodle stand steams. A hooded figure at a booth watches."],
            ["rook", "Byte! Ready to lose on my street again? Home turf, baby."],
            ["byte", "Your home turf advantage is 4%. I have patched it out."],
            ["rook", "You can't patch out a vibe!"]
          ],
          after: [
            ["byte", "Victory. Vibe patched. Rook is now 4% less smug."],
            ["rook", "...Only 4%? I'll take it."]
          ]
        },
        rocky: {
          before: [
            ["narrator", "Lab 7. R.O.C.K.Y is vacuuming the rubble from a wall he charged through."],
            ["rocky", "HELLO, FELLOW ROBOT. PLEASE WAIT. I AM 98% DONE TIDYING."],
            ["byte", "I will wait. Tidiness increases fight efficiency by 2%."],
            ["rocky", "DONE. NOW ENGAGING HORNS. SORRY IN ADVANCE FOR THE NEW MESS."]
          ],
          after: [
            ["rocky", "DEFEAT ACCEPTED. I WILL NOW VACUUM MYSELF UP."]
          ]
        },
        prophet: {
          before: [
            ["narrator", "A misty crossroads. The '$1 PROPHECIES' wagon creaks. Byte's scanner reads: hood."],
            ["byte", "Scanning... Face not found. Two bright pixels detected. Please update face."],
            ["prophet", "Prophecy: someone here gets shut down tonight. It is not me."],
            ["narrator", "The cloak hits the dirt. Galaxy skin. A golden halo. Two angry, glowing eyes."],
            ["byte", "Halo: bright. Threat: real. Deploying patch: 'win'."]
          ],
          after: [
            ["byte", "Prophecy check: someone got shut down. It was you. Accuracy: 50%."],
            ["prophet", "...Rounding up."]
          ]
        }
      },
      ending: [
        ["narrator", "Byte returns to the data centre with the Grand Brawl trophy in its cooling vent."],
        ["byte", "Patch notes: 'Byte is champion.' Known issue: everyone else is sad."],
        ["narrator", "Taped to its server rack is a card: 'Your fan will spin.' It has a $1 price sticker."],
        ["byte", "Prediction confirmed. Fan spinning. With pride."]
      ]
    },

    bobbie: {
      title: "The Street Champ",
      intro: [
        ["narrator", "Macalanger Gym. Grandpa tapes a flyer to the mirror: 'GRAND BRAWL. Winner gets a belt.'"],
        ["bobbie", "A BELT? Grandpa! I gotta win that! It'll match my sneakers!"],
        ["narrator", "Outside the window: a fortune teller's wagon. A dark hood. A sign: '$1 PROPHECIES'."],
        ["bobbie", "Ayy, HOODIE! Tell me I win! ...He's not talking. RUDE!"]
      ],
      order: ["rocky", "zoombie", "ninja", "byte", "bananas", "rook", "prophet"],
      fights: {
        rocky: {
          before: [
            ["narrator", "Lab 7. Safety goggles everywhere. Bobbie wears his on his afro, like a crown."],
            ["rocky", "HUMAN BOBBIE. ALERT: THIS IS A LABORATORY. NO SHOUTING."],
            ["bobbie", "I'M NOT SHOUTING, BIG BULL! THIS IS MY INSIDE VOICE!"],
            ["rocky", "SOUND LEVEL: 104 DECIBELS. YOUR INSIDE IS VERY LOUD."]
          ],
          after: [
            ["rocky", "DEFEAT CONFIRMED. MY EARS ARE RINGING. I DO NOT HAVE EARS."]
          ]
        },
        zoombie: {
          before: [
            ["narrator", "The night safari. A zebra stares at Bobbie's sneakers. It seems jealous."],
            ["zoombie", "Bobbie! Meet Doris. She's a tortoise. She's 104. Huge boxing fan."],
            ["bobbie", "Ayy, DORIS! Watch me knock out your friend SWAMP SOCKS here!"],
            ["zoombie", "Doris says 'go slow'. Doris says that about everything."]
          ],
          after: [
            ["zoombie", "You won. Doris is heading over to cheer. She'll get here by Thursday."]
          ]
        },
        ninja: {
          before: [
            ["narrator", "The hidden dojo. Bobbie ducks under a paper sign: 'SILENCE. NINJA AT WORK.'"],
            ["ninja", "Bobbie! You will never hear me coming!"],
            ["bobbie", "Kid, I heard you from the parking lot. You were humming your own theme song!"],
            ["ninja", "It is a stealth theme! It goes 'shhhh'. Prepare!"]
          ],
          after: [
            ["ninja", "You saw only 1% of my potential!"],
            ["bobbie", "Then bring the other 99 to my gym, SHADOW SPROUT! Saturdays!"]
          ]
        },
        byte: {
          before: [
            ["narrator", "The data centre. Bobbie high-fives a server. The server reboots."],
            ["byte", "Stop touching the equipment. Patch 3.4 removed high-fives."],
            ["bobbie", "No high-fives?! Saddest patch I ever heard, CALCULATOR!"],
            ["byte", "Then try this patch: me, winning."]
          ],
          after: [
            ["byte", "Loss recorded. Rolling back patch 3.4. One high-five permitted."],
            ["bobbie", "THERE it is! Up top!"]
          ]
        },
        bananas: {
          before: [
            ["narrator", "Fruit Aisle 7. Bobbie shadowboxes past the melons. The melons do not flinch."],
            ["bananas", "Big hair man! BANANAS has been training! BANANAS did ONE push-up!"],
            ["bobbie", "With no arms? HOW?!"],
            ["bananas", "BANANAS rolled forward. Then rolled back. It counts!"]
          ],
          after: [
            ["bobbie", "You got heart, JUICE BOX! Gym's open Saturdays!"],
            ["bananas", "BANANAS will be there! With gloves on his feet!"]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District. Rook stands under his favourite sign. Half of it flickers out."],
            ["rook", "Bobbie. My street, my sign. Mostly my sign."],
            ["bobbie", "Your sign's missing a letter, HEADBAND! Just like your chances!"],
            ["rook", "...Okay, that was good. Still gonna win."]
          ],
          after: [
            ["rook", "Fine. You win. Don't tell the noodle guy."],
            ["bobbie", "I'M TELLING EVERYBODY!"]
          ]
        },
        prophet: {
          before: [
            ["narrator", "A misty crossroads. The fortune teller's wagon sits in the middle, lanterns aglow."],
            ["bobbie", "HOODIE! You've been at every one of my fights! What's the deal?"],
            ["prophet", "My prophecy: tonight, you will see stars. I win."],
            ["narrator", "The cloak flies off. Galaxy skin, a golden halo, two furious glowing eyes."],
            ["bobbie", "Oh, you ARE the stars! Okay, STARFISH, step into my ring!"]
          ],
          after: [
            ["bobbie", "Saw the stars, punched the stars! Prophecy complete!"],
            ["prophet", "Half of it came true. I hate that half."]
          ]
        }
      },
      ending: [
        ["narrator", "Macalanger Gym. The belt hangs on the wall next to Grandpa's old gloves."],
        ["bobbie", "Grandpa! I won! Everybody got a nickname! Even the guy made of space!"],
        ["narrator", "Grandpa smiles. 'And did you learn when NOT to throw a punch?'"],
        ["bobbie", "...I learned when to throw a LOT of them. That counts, right?"]
      ]
    },

    rocky: {
      title: "Heart of Steel",
      intro: [
        ["narrator", "Lab 7. R.O.C.K.Y finds a flyer: 'GRAND BRAWL. Prove your worth.'"],
        ["rocky", "CALCULATING WORTH... ERROR. MORE DATA REQUIRED. GATHERING DATA BY FIGHTING."],
        ["narrator", "On the lab roof, somehow, a fortune teller's wagon. A hooded figure waves. Slowly."],
        ["rocky", "HOW DID YOU GET A WAGON ON THE ROOF. ...WAVING BACK."]
      ],
      order: ["bananas", "ninja", "byte", "zoombie", "rook", "bobbie", "prophet"],
      fights: {
        bananas: {
          before: [
            ["narrator", "Fruit Aisle 7. R.O.C.K.Y has been asked to leave the egg section. Twice."],
            ["bananas", "Big bull robot! BANANAS remembers you! From the lab!"],
            ["rocky", "I REMEMBER YOU. YOU WERE SMALLER AND YOUR MOUTH WAS MARKER."],
            ["bananas", "BANANAS had a glow-up! Literally! FIGHT!"]
          ],
          after: [
            ["rocky", "THREAT NEUTRALISED. I WILL NOW PAY FOR THE ORANGE."],
            ["bananas", "BANANAS IS NOT FOR SALE!"]
          ]
        },
        ninja: {
          before: [
            ["narrator", "The hidden dojo. R.O.C.K.Y fits through the door after removing the door."],
            ["ninja", "You broke my door! That door was hidden!"],
            ["rocky", "IT WAS VERY WELL HIDDEN. I DID NOT SEE IT UNTIL I WAS WEARING IT."],
            ["ninja", "Then witness a technique nobody sees coming!"]
          ],
          after: [
            ["ninja", "Only 1% of my potential! The rest was behind the door you broke."],
            ["rocky", "I WILL REBUILD THE DOOR. WITH A HIDDEN DOORBELL."]
          ]
        },
        byte: {
          before: [
            ["narrator", "The data centre. The servers look cold. R.O.C.K.Y offers each one a blanket."],
            ["byte", "You are blocking airflow. And being nice to hardware. Stop both."],
            ["rocky", "I CANNOT STOP. KINDNESS IS NOT CONNECTED TO MY OFF SWITCH."],
            ["byte", "Then I will find your off switch."]
          ],
          after: [
            ["byte", "Loss confirmed. Note for patch 9: 'The bull is too wholesome to beat.'"]
          ]
        },
        zoombie: {
          before: [
            ["narrator", "The night safari. An elephant meets R.O.C.K.Y. They compare horns and tusks."],
            ["zoombie", "Ooh, she likes you! Ellie never likes anyone. She sat on the last tour bus."],
            ["rocky", "I WILL TRY NOT TO BE SAT ON. FIGHTING YOU NOW. GENTLY."],
            ["zoombie", "Not too gently. My arm falls off if you sneeze."]
          ],
          after: [
            ["zoombie", "Ow. My arm fell off. ...Oh, found it. Good as new. Ish."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District. R.O.C.K.Y helps a granny cross the street. Then carries her car."],
            ["rook", "Big guy, you're making me look bad on my own street. Everyone loves you."],
            ["rocky", "I DO NOT WISH TO MAKE YOU LOOK BAD. I WILL DEFEAT YOU POLITELY."],
            ["rook", "That's the scariest thing anyone's ever said to me."]
          ],
          after: [
            ["rook", "Lost on my own street. To a NICE bull. Worst day ever."],
            ["rocky", "WOULD YOU LIKE A HUG. IT IS A NEW FEATURE."]
          ]
        },
        bobbie: {
          before: [
            ["narrator", "Macalanger Gym. A sticky note on the heavy bag asks: 'Bull-proof?' It is not."],
            ["bobbie", "BIG BULL! Heard you've been beating everybody! Step into my ring!"],
            ["rocky", "I HAVE STEPPED INTO YOUR RING. YOUR RING HAS STEPPED INTO THE FLOOR."],
            ["bobbie", "...That's coming out of your prize money!"]
          ],
          after: [
            ["bobbie", "Respect, BIG BULL! You hit like a moving truck!"],
            ["rocky", "THANK YOU. I WAS ONCE TESTED AGAINST ONE. IT LOST."]
          ]
        },
        prophet: {
          before: [
            ["narrator", "A misty crossroads. The fortune teller's wagon. The crystal ball glows."],
            ["rocky", "HOODED HUMAN. YOU HAVE APPEARED AT SIX FIGHTS. ARE YOU IN DANGER."],
            ["prophet", "My crystal ball says: victory."],
            ["narrator", "The cloak drops. A floating galaxy, a blazing golden halo, two furious eyes."],
            ["rocky", "NOT HUMAN. NOT IN DANGER. CORRECTION: NOW IN DANGER."]
          ],
          after: [
            ["rocky", "I HAVE INSPECTED YOUR CRYSTAL BALL. IT IS A SNOW GLOBE."],
            ["prophet", "...It was on sale."]
          ]
        }
      },
      ending: [
        ["narrator", "Lab 7. R.O.C.K.Y puts the trophy next to a photo of everyone he fought."],
        ["rocky", "CALCULATING HEART PERCENTAGE... 41%... 58%... 100%."],
        ["rocky", "RESULT: I HAVE A HEART. IT CONTAINS SIX FRIENDS. ONE OF THEM IS AN ORANGE."],
        ["narrator", "He gives a thumbs-up. He is holding a wall at the time. It is a very proud wall."]
      ]
    },

    ninja: {
      title: "Only 1%",
      intro: [
        ["narrator", "The hidden dojo. Ninja Main unrolls his ancient scroll and reads it aloud. Loudly."],
        ["ninja", "'Become the greatest ninja by defeating every fighter.' ...'Spring rolls, $4.'"],
        ["narrator", "Outside, a hooded fortune teller parks his wagon and watches the dojo."],
        ["ninja", "A mysterious hooded figure! My secret ninja master, surely! ...Hello, master!"]
      ],
      order: ["bananas", "rook", "zoombie", "bobbie", "rocky", "byte", "prophet"],
      fights: {
        bananas: {
          before: [
            ["narrator", "Fruit Aisle 7. Ninja Main hides behind a pineapple. It's a very small pineapple."],
            ["bananas", "BANANAS sees you, ninja! All of you is outside the pineapple!"],
            ["ninja", "It's a decoy pineapple! The real me is... also here."],
            ["bananas", "BANANAS respects the effort! FIGHT!"]
          ],
          after: [
            ["bananas", "BANANAS is defeated! Teach BANANAS the pineapple trick!"],
            ["ninja", "There is no trick. There is only pineapple."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District. Ninja Main drops from a rooftop. It takes him four tries."],
            ["rook", "Nice landing. My favourite was the third one. The one into the trash can."],
            ["ninja", "That was a planned trash can! Ninjas hide in trash cans!"],
            ["rook", "You came out with a banana peel on your head. Let's do this."]
          ],
          after: [
            ["rook", "Okay. That was actually cool."],
            ["ninja", "You saw 1% of my potential! ...Will you sign my scroll?"]
          ]
        },
        zoombie: {
          before: [
            ["narrator", "The night safari. Ninja Main hides among the flamingos, on one leg. Wobbling."],
            ["zoombie", "Ooh, a new flamingo! Black feathers, funny mask. Very rare species."],
            ["ninja", "My disguise works! The zookeeper believes I am a bird!"],
            ["zoombie", "...Hang on. Flamingos don't carry throwing stars. Fight time!"]
          ],
          after: [
            ["zoombie", "You won! You're going in my bird book anyway. 'Ninja Flamingo. Very loud.'"]
          ]
        },
        bobbie: {
          before: [
            ["narrator", "Macalanger Gym. Ninja Main sneaks in through the air vent. He gets stuck in it."],
            ["bobbie", "VENT BOY! I can see your feet hanging outta my ceiling!"],
            ["ninja", "This is the Hanging Bat Technique! It is very advanced!"],
            ["bobbie", "It's very STUCK! Hold on, I'll pull you down, then knock you down!"]
          ],
          after: [
            ["bobbie", "Good hustle, VENT BOY! More cardio, less vent!"]
          ]
        },
        rocky: {
          before: [
            ["narrator", "Lab 7. Ninja Main has painted himself grey to blend in with the robots."],
            ["rocky", "GREY HUMAN DETECTED. YOU ARE NOT A ROBOT. YOU HAVE A NOSE."],
            ["ninja", "Robots can have noses! It is a... smell sensor!"],
            ["rocky", "...I WANT ONE. AFTER THE FIGHT, TELL ME WHERE TO BUY A NOSE."]
          ],
          after: [
            ["rocky", "DEFEATED BY A NINJA WITH A NOSE. LOGGING THIS AS A GOOD DAY ANYWAY."]
          ]
        },
        byte: {
          before: [
            ["narrator", "The data centre. Ninja Main crawls under the laser grid. There is no laser grid."],
            ["byte", "Why are you crawling. The floor is clean, but not that clean."],
            ["ninja", "Ninjas always assume there are lasers! It is ninja law!"],
            ["byte", "Fine. Patch 6.0: 'Added lasers.' ...That was a joke. My first. Fight."]
          ],
          after: [
            ["byte", "Defeated by a ninja who crawled. Statistically embarrassing. Logging as 'rare'."]
          ]
        },
        prophet: {
          before: [
            ["narrator", "A misty crossroads. The fortune teller's wagon is parked under a lonely lantern."],
            ["ninja", "Master! You came to all my fights! Am I ready to learn your secret?"],
            ["prophet", "I foresee a ninja will vanish. Then I win."],
            ["narrator", "The cloak falls. Galaxy skin, a blazing golden halo, eyes glowing with fury."],
            ["ninja", "Master has a HALO?! ...Fine! Almost Invisible! Vanishing! Right now!"]
          ],
          after: [
            ["prophet", "The ninja vanished. Then he hit me. I had the order wrong."],
            ["ninja", "That was 2% of my potential! A new personal best!"]
          ]
        }
      },
      ending: [
        ["narrator", "The hidden dojo. Ninja Main hangs the Grand Brawl trophy beside his scroll."],
        ["ninja", "I am the greatest ninja the world has ever seen. Nobody saw it, of course."],
        ["narrator", "Then he steps on one of his own throwing stars."],
        ["ninja", "OW! ...That was only 1% of my pain!"]
      ]
    },

    zoombie: {
      title: "Night Shift",
      intro: [
        ["narrator", "The night safari research station. ZOO-mbie reads his clipboard: 'Feed giraffes. Win.'"],
        ["zoombie", "Who wrote 'win'? ...Oh, that's my handwriting. Okay then."],
        ["narrator", "By the gate stands a fortune teller's wagon. '$1 PROPHECIES'. Two eyes glow in a hood."],
        ["zoombie", "Ooh, I'll ask if my pulse is coming back. ...Later. Giraffes first."]
      ],
      order: ["byte", "bananas", "bobbie", "ninja", "rocky", "rook", "prophet"],
      fights: {
        byte: {
          before: [
            ["narrator", "The data centre. It's cold enough to keep bananas fresh. ZOO-mbie approves."],
            ["byte", "ZOO-mbie. Please stop storing fruit in Server 12."],
            ["zoombie", "But it's the perfect temperature! Also there's a moth in here! Hi, moth!"],
            ["byte", "The moth is a known bug. Literally. Patch pending. Fight."]
          ],
          after: [
            ["zoombie", "I won! The moth's coming home with me. Its name is Patch."]
          ]
        },
        bananas: {
          before: [
            ["narrator", "Fruit Aisle 7. ZOO-mbie's eyes go wide. So many bananas. Real ones."],
            ["zoombie", "This is heaven. Is this heaven? Am I extra dead now?"],
            ["bananas", "Focus, zombie friend! BANANAS is the main fruit in this aisle!"],
            ["zoombie", "You're not even a banana. But I'll fight for these ones."]
          ],
          after: [
            ["bananas", "BANANAS lost. BANANAS will let you have ONE banana."],
            ["zoombie", "I'll take six."]
          ]
        },
        bobbie: {
          before: [
            ["narrator", "Macalanger Gym. ZOO-mbie's arm falls off in warm-ups. He pops it back on."],
            ["bobbie", "Did your ARM just—?! You good, SPOOKY SLIM?!"],
            ["zoombie", "Happens all the time. Let's fight before the other one goes."],
            ["bobbie", "Bro. I'll go easy on that side."]
          ],
          after: [
            ["bobbie", "You beat me with your arm held on by HOPE?! I gotta train harder!"]
          ]
        },
        ninja: {
          before: [
            ["narrator", "The hidden dojo. A cat is asleep on the training mat. ZOO-mbie forgets the fight."],
            ["zoombie", "A cat! Hi, cat! Who's a good stealthy cat?"],
            ["ninja", "That is my sensei! ...Okay, it's a cat. But it's very wise!"],
            ["zoombie", "It's asleep. That IS wise. Okay, let's fight quietly for the cat."]
          ],
          after: [
            ["ninja", "You won... and my sensei purred for YOU. Betrayal!"]
          ]
        },
        rocky: {
          before: [
            ["narrator", "Lab 7. A row of sample jars. One says 'DO NOT SNIFF'. ZOO-mbie sniffs it."],
            ["rocky", "ALERT. THAT WAS FLOOR CLEANER. CALCULATING YOUR WELLBEING."],
            ["zoombie", "I'm already dead, mate. Smelled like bananas, though. Nice."],
            ["rocky", "WELLBEING: CONFUSING. FIGHTING ANYWAY."]
          ],
          after: [
            ["rocky", "DEFEAT ACCEPTED. HAVE YOU CHECKED YOUR PULSE."],
            ["zoombie", "Hold on... nope! Still gone! Great fight, though."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District, past midnight. ZOO-mbie waves at a raccoon raiding the bins."],
            ["zoombie", "Rook! Your street has raccoons! Wonderful raccoons!"],
            ["rook", "Those raccoons have been stealing my noodles for years."],
            ["zoombie", "Then I'm on their side. Sorry. Team Raccoon."]
          ],
          after: [
            ["rook", "Lost to a zombie and three raccoons. Unbelievable."],
            ["zoombie", "Four raccoons. Ted was hiding."]
          ]
        },
        prophet: {
          before: [
            ["narrator", "A misty crossroads. The crickets go quiet. The wagon's lanterns flicker."],
            ["zoombie", "The fortune teller! Quick question: is my pulse ever coming back?"],
            ["prophet", "My prophecy: one of us leaves here without a pulse. I win."],
            ["narrator", "The cloak is flung aside. A floating galaxy, a golden halo, furious eyes."],
            ["zoombie", "Oh, I always leave without a pulse. That's just me. Ready when you are."]
          ],
          after: [
            ["zoombie", "See? I'm leaving without a pulse. Prophecy correct! And I won!"],
            ["prophet", "...I did not foresee the zombie part."]
          ]
        }
      },
      ending: [
        ["narrator", "Back at the station, ZOO-mbie hangs his medal on a giraffe. She looks fantastic."],
        ["zoombie", "Seven wins, fourteen new animal friends and one moth called Patch."],
        ["narrator", "He checks his pulse one last time. Nothing. He shrugs and peels a banana."],
        ["zoombie", "Brains? Nah. Champions eat bananas."]
      ]
    },

    bananas: {
      title: "The Juicy Jumper",
      intro: [
        ["narrator", "Fruit Aisle 7. BANANAS spots a poster: 'GRAND BRAWL. Fame! Glory! A trophy!'"],
        ["bananas", "A trophy BANANAS can't hold, because NO ARMS! BANANAS STILL WANTS IT!"],
        ["narrator", "In the car park sits a fortune teller's wagon. Two eyes glow at the orange."],
        ["bananas", "Spooky hood man! BANANAS will win, then come back and buy a fortune!"]
      ],
      order: ["zoombie", "bobbie", "byte", "ninja", "rook", "rocky", "prophet"],
      fights: {
        zoombie: {
          before: [
            ["narrator", "The night safari. A monkey points at BANANAS and screams with joy."],
            ["zoombie", "A BANANA! At last! ...Oh. It's you. Round, orange, loud. Hi, friend."],
            ["bananas", "The monkey thinks BANANAS is a banana! The monkey is RIGHT!"],
            ["zoombie", "The monkey also thinks my hat is a banana. Fight!"]
          ],
          after: [
            ["zoombie", "You won! The monkey's your fan now. He's throwing peels in your honour."]
          ]
        },
        bobbie: {
          before: [
            ["narrator", "Macalanger Gym. BANANAS bounces on the speed bag. The speed bag wins."],
            ["bobbie", "LIL' SUNSHINE! You're meant to punch the bag, not ride it!"],
            ["bananas", "BANANAS has NO ARMS! Riding is the only option!"],
            ["bobbie", "Fair! Then ride THIS! Step into my ring!"]
          ],
          after: [
            ["bobbie", "Beat by a fruit. Grandpa's gonna laugh for a week. RESPECT, SUNSHINE!"]
          ]
        },
        byte: {
          before: [
            ["narrator", "The data centre. BANANAS rolls between the servers. An alarm goes off."],
            ["byte", "Warning: citrus near hardware. Juice will void the warranty."],
            ["bananas", "BANANAS is not juicy! BANANAS is MUSCULAR!"],
            ["byte", "You are an orange. Your muscles are pulp. Initiating fight."]
          ],
          after: [
            ["byte", "Defeated by pulp. Adding to the patch notes: 'Nerf oranges.'"],
            ["bananas", "YOU CAN'T NERF BANANAS!"]
          ]
        },
        ninja: {
          before: [
            ["narrator", "The hidden dojo. Out front, a sign with Ninja Main's face: 'HIDDEN DOJO, THIS WAY'."],
            ["bananas", "BANANAS found the hidden dojo! There was a sign!"],
            ["ninja", "The sign is a trap! For... finding me. ...Okay, the sign is bad."],
            ["bananas", "BANANAS loved the sign! FIGHT!"]
          ],
          after: [
            ["ninja", "Beaten by a fruit who read my sign. I'm getting a smaller sign."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District. There's an orange on the noodle stand counter. It is BANANAS."],
            ["rook", "Hey! Off the counter, you're scaring the customers."],
            ["bananas", "BANANAS IS a customer! BANANAS wants noodles! Hand-fed, please!"],
            ["rook", "...I'll beat you first. Then we'll talk noodles."]
          ],
          after: [
            ["rook", "Fine. Noodles are on me. Open wide."],
            ["bananas", "BANANAS has the best mouth! It used to be marker!"]
          ]
        },
        rocky: {
          before: [
            ["narrator", "Lab 7. A broken glass case. A sticky note: 'Growth Serum #9. Do not touch.'"],
            ["rocky", "ORANGE. MY RECORDS SAY YOU WERE MADE HERE. WELCOME HOME."],
            ["bananas", "BANANAS was born in a grocery store! BANANAS was just UPGRADED here!"],
            ["rocky", "UNDERSTOOD. I WAS ALSO UPGRADED HERE. WE ARE UPGRADE COUSINS."]
          ],
          after: [
            ["rocky", "DEFEAT ACCEPTED, COUSIN. I WILL ADD YOU TO THE FAMILY PHOTO."],
            ["bananas", "BANANAS goes in the middle! BANANAS is round, he fits anywhere!"]
          ]
        },
        prophet: {
          before: [
            ["narrator", "A misty crossroads. The hooded fortune teller waits beside his little wagon."],
            ["bananas", "Spooky hood man! BANANAS won everything! Now tell BANANAS's fortune!"],
            ["prophet", "I foresee an orange will fall. And I win."],
            ["narrator", "He throws off the cloak. Galaxy skin. A blazing halo. Very cross eyes."],
            ["bananas", "SHINY! BANANAS HAS ARRIVED!"]
          ],
          after: [
            ["narrator", "BANANAS does a victory spin, three bounces... and falls over."],
            ["prophet", "The orange fell. I was half right."],
            ["bananas", "BANANAS falls over EVERY time! You should've foreseen THAT!"]
          ]
        }
      },
      ending: [
        ["narrator", "Fruit Aisle 7. BANANAS balances the trophy on his head. It falls. He tries again."],
        ["bananas", "BANANAS is the CHAMPION! Fame! Glory! A slightly dented trophy!"],
        ["narrator", "On the shelf, a note in a kid's handwriting: 'Was that my orange?? -the boy'"],
        ["bananas", "THE BOY! He still owes BANANAS a better mouth! NEW ADVENTURE!"]
      ]
    },

    prophet: {
      title: "$1 Prophecies",
      intro: [
        ["narrator", "A misty crossroads. A tiny wagon. A crystal ball. A sign: '$1 PROPHECIES'."],
        ["prophet", "I foresee a tour."],
        ["narrator", "He lights the lanterns, packs the crystal ball and hitches the wagon. To himself."],
        ["prophet", "Seven venues. Seven fights. Seven wins. Already seen it."]
      ],
      order: ["bananas", "zoombie", "ninja", "byte", "bobbie", "rocky", "rook"],
      fights: {
        bananas: {
          before: [
            ["narrator", "Fruit Aisle 7. PROPHET parks his wagon between the melons and the grapes."],
            ["bananas", "Hood man! BANANAS brought a dollar for a fortune! ...BANANAS can't hold it."],
            ["prophet", "I foresee juice."],
            ["narrator", "He throws off the cloak. The grapes gasp. The melons stay calm."]
          ],
          after: [
            ["prophet", "Juice. As foretold."],
            ["bananas", "BANANAS is NOT juice! BANANAS is just a bit squishy now."]
          ]
        },
        zoombie: {
          before: [
            ["narrator", "The night safari. The wagon parks by the hippo pool. The hippo is not impressed."],
            ["zoombie", "Ooh, a booth! What's my fortune? Is it a banana?"],
            ["prophet", "You will see an animal."],
            ["zoombie", "I see ALL the animals! You're amazing! ...Why are you taking the cloak off?"]
          ],
          after: [
            ["zoombie", "I lost. But I saw an animal. A hippo! You were so right."],
            ["prophet", "I always am."]
          ]
        },
        ninja: {
          before: [
            ["narrator", "The hidden dojo. PROPHET's wagon is parked inside. Nobody knows how."],
            ["ninja", "Master! You came to my dojo! Teach me to be mysterious!"],
            ["prophet", "Lesson one."],
            ["narrator", "The cloak flies off. Galaxy skin, a blazing halo, eyes glowing with fury."],
            ["ninja", "Lesson one is SCARY! Okay! Ninja ready!"]
          ],
          after: [
            ["ninja", "That was only 1% of my... no, honestly, that was all of it. Ow."],
            ["prophet", "Lesson two: no refunds."]
          ]
        },
        byte: {
          before: [
            ["narrator", "The data centre. PROPHET's lanterns warm the server room by two degrees."],
            ["byte", "Fortune teller. Your lanterns are a fire hazard. Also a vibe hazard."],
            ["prophet", "I foresee a reboot."],
            ["byte", "Probability of reboot: 0.4%. ...Why is your halo so bright."]
          ],
          after: [
            ["byte", "Rebooting... Patch notes: 'PROPHET was right.' I hate this patch."]
          ]
        },
        bobbie: {
          before: [
            ["narrator", "Macalanger Gym. PROPHET's wagon is parked in the ring. Bobbie is not happy."],
            ["bobbie", "HOODIE! That's MY ring! You can't park a whole booth in my ring!"],
            ["prophet", "I foresaw a parking space."],
            ["bobbie", "It ain't a parking space! Fine, lose the hood and let's GO!"]
          ],
          after: [
            ["bobbie", "Lost in my own gym! To a GUY WITH A WAGON! ...Respect, though, HOODIE."],
            ["prophet", "Parking validated."]
          ]
        },
        rocky: {
          before: [
            ["narrator", "Lab 7. The wagon rolls in through one of R.O.C.K.Y's bull-shaped holes."],
            ["rocky", "HOODED VISITOR. THIS IS A RESTRICTED AREA. DO YOU HAVE A BADGE."],
            ["prophet", "I foresaw no badge."],
            ["rocky", "THEN I MUST ESCORT YOU OUT. POLITELY. WITH HORNS."]
          ],
          after: [
            ["rocky", "DEFEAT ACCEPTED. I WILL PRINT YOU A VISITOR BADGE."],
            ["prophet", "The photo is just the hood."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District. The final stop. The wagon parks under Rook's favourite sign."],
            ["rook", "So you're the hood guy who beat everyone. You won't beat me. Not on..."],
            ["prophet", "...'my street'. Foreseen."],
            ["rook", "...Okay, that's annoying."],
            ["narrator", "The cloak flies off. The neon flickers. The noodles go cold."]
          ],
          after: [
            ["rook", "Fine. You're good. Annoyingly, accurately good."],
            ["prophet", "One dollar."]
          ]
        }
      },
      ending: [
        ["narrator", "The misty crossroads. PROPHET hangs seven trophies from his striped canopy."],
        ["prophet", "As foretold."],
        ["narrator", "The hood goes back up. Only two eyes glow. A new review arrives: 'Two stars. Correct.'"],
        ["prophet", "Up from 1.2. Foreseen."]
      ]
    }
  }
};
