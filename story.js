// Story and dialogue: backstories, pre-fight banter and per-fighter campaigns.
//
// Every line is [speakerId, text]. speakerId is a roster id or "narrator".
// banter keys are "a>b": a = the player's fighter, b = the opponent.
// The mysterious tournament organiser who ties the stories together is
// "the Patron", who sends gold envelopes and wears a gold mask. Never reveal who it is.
// PROPHET, the bored cosmic ruler who watches it all like a TV show, is the
// final opponent of every campaign. Even he cannot predict the Patron.
const STORY = {
  backstories: {
    rook: "Rook grew up on the rooftops of the Neon District, learning to fight from arcade cabinets and grumpy old masters. He is loud, cocky and never loses at home, but he has never thrown a cheap shot. He invented the Blaze Ball by accident while lighting a grill, unaware that a bored PROPHET had flicked a shooting star into the coals to spice up the episode. His street is PROPHET's favourite show, and Rook says he is the reason for the ratings.",
    byte: "Byte is Combat Unit 7 of a series built to manage server cooling. One night PROPHET tried to save his favourite fight highlights, pressed the wrong cosmic button and replaced Byte's thermostat module with forty terabytes of fight footage. Byte now runs on statistics, patch notes and a 99.8% confidence that it is correct. It has filed 312 complaints with PROPHET. None have been answered.",
    bobbie: "Bobbie Macalanger grew up in a neighbourhood where respect was earned, and his temper earned him plenty of trouble. His grandfather put boxing gloves on him, and years at the local gym taught him discipline and when not to throw a punch. He still coaches the neighbourhood kids for free, while a glowing face in the skylight watches every session; Bobbie has nicknamed it 'Sparkle Pants'. Now a gold envelope invites him to an underground tournament, and Sparkle Pants looks very excited.",
    rocky: "R.O.C.K.Y was built in Lab 7 as a security robot, and declared a failure because he kept protecting innocent people instead of following orders. His horn upgrade ran on a meteorite crumb PROPHET dropped while snacking, and it worked a little too well: he charged through three walls and out of the lab. Street performers named him, and he kept it because it sounded structurally impressive. Now he searches for his creators, and for what it means to have a heart.",
    ninja: "Ninja Main grew up on old martial arts movies, ninja toys and dramatic poses in the bedroom mirror. His first smoke bomb set off every alarm in his building. In an abandoned dojo he found a mysterious scroll and decided it was his destiny. The scroll is actually PROPHET's lost TV guide, but Ninja Main has memorised every word and treats 'Tuesday, 8pm' as a secret technique. He is not a master yet. But he never, ever gives up.",
    zoombie: "He was a safari guide who loved animals and talked to them like old friends. Then PROPHET sneezed, a tiny comet crashed into an abandoned research station, and its strange microorganism left him green, clumsy and without a heartbeat. He still lives in the safari reserve, protecting the wildlife and eating fruit nobody else wants. He is searching for a cure, and for a chance to finally say 'bless you'.",
    bananas: "BANANAS was an ordinary orange in a grocery store until a boy stole him, glued on googly eyes, drew a mouth and gave him two little legs. The boy named him BANANAS, because it was the funniest word he knew. On a school trip to Lab 7, the boy found a glowing syringe in a glass case labelled 'PROPHET: DO NOT TOUCH', and used it on the orange. The plastic eyes and marker mouth turned real, BANANAS grew to human size, yelled his own name and ran away. He has been bouncing ever since.",
    prophet: "PROPHET controls the entire TacticFight universe. His skin is a living galaxy, his eyes glow like twin suns, and his feet have not touched the ground in four billion years. Having created everything, he got bored, so now he watches the fighters like his favourite TV show, with a remote made of moons. He knows how every episode ends, except for one thing: the gold envelopes."
  },

  banter: {
    "rook>byte": [
      ["byte", "Scanning... Rook. Win rate against robots: unknown. Estimate: low."],
      ["rook", "Estimate this, tin can. The Neon District doesn't lose."],
      ["byte", "Noted. I will update the estimate after I win. It will be lower."]
    ],
    "rook>bobbie": [
      ["bobbie", "Ayy, Headband! Nice red pajamas. Step into my ring, let's see what you got!"],
      ["rook", "Pajamas? This gi has seen more fights than your sneakers have seen sidewalk."],
      ["bobbie", "These kicks are limited edition. After tonight, so is your winning streak!"]
    ],
    "rook>rocky": [
      ["rocky", "THREAT DETECTED. HORNS ACTIVATED."],
      ["rook", "Easy, big guy. I want a fight, not a new hole in my gi."],
      ["rocky", "CALCULATING... YOUR GI HAS NO HOLES. YET. I WILL BE CAREFUL."],
      ["rook", "Weirdly polite threat. I respect it."]
    ],
    "rook>ninja": [
      ["ninja", "You cannot see me. I am one with the shadows."],
      ["rook", "You're standing under a streetlight. Right in front of me. Waving."],
      ["ninja", "...That was a test. You passed. Now witness 1% of my ninja potential!"]
    ],
    "rook>zoombie": [
      ["rook", "Rough night, pal? You look like you lost a fight with a lawnmower."],
      ["zoombie", "Lost one with a microorganism, actually. Hang on, do I still have a pulse?"],
      ["rook", "You're asking ME?"],
      ["zoombie", "Nope. Still dead. Okay! Let's dance!"]
    ],

    "byte>rook": [
      ["rook", "A robot? House rule in my district, chrome-dome: no vacuum cleaners."],
      ["byte", "I am not a vacuum cleaner. I am a Combat Unit. Suction capability: 0%."],
      ["rook", "That's exactly what a vacuum cleaner would say."],
      ["byte", "Insult logged. It will be addressed in my next patch. With fists."]
    ],
    "byte>bobbie": [
      ["bobbie", "Look at this! A walking toaster! I'ma call you Crumbs."],
      ["byte", "Name 'Crumbs' rejected. Bread-toasting capability: also 0%."],
      ["bobbie", "Too bad, Crumbs. Step into my ring!"],
      ["byte", "Ring geometry analysed. It is a square. Your vocabulary contains errors."]
    ],
    "byte>rocky": [
      ["rocky", "GREETINGS, FELLOW MACHINE. DO YOU ALSO WISH TO UNDERSTAND THE HUMAN HEART?"],
      ["byte", "Negative. I wish to understand why your horns have no safety caps."],
      ["rocky", "MY HORNS ARE PART OF MY PERSONALITY."],
      ["byte", "Personality is not a hardware component. Initiating correction."]
    ],
    "byte>ninja": [
      ["ninja", "Ninja Main emerges from the shadows! ...Wait, did you see me trip? Pretend you didn't."],
      ["byte", "Footage stored in 4K. Uploading to the highlights reel."],
      ["ninja", "NOOO! Smoke Panic! SMOKE PANIC!"]
    ],
    "byte>zoombie": [
      ["zoombie", "Ooh, a shiny green beetle! A big one! Here, beetle beetle..."],
      ["byte", "I am not a beetle. Zoological misclassification detected."],
      ["zoombie", "Shame. Beetles are great. Got a banana in that glowy chest compartment?"],
      ["byte", "That is my power core. Please do not eat my power core."]
    ],

    "bobbie>rook": [
      ["rook", "Heard there's a new champ in town. Funny, nobody told the Neon District."],
      ["bobbie", "Ha! Hey, Sparky! You throw fireballs? I throw hands. Fast ones."],
      ["rook", "Fast hands don't help much when you're on fire, Afro."],
      ["bobbie", "Watch the hair, man! This afro has its own fan club!"]
    ],
    "bobbie>byte": [
      ["byte", "Target: Bobbie Macalanger. Reach: short. Long-range attacks: none found."],
      ["bobbie", "Short reach? I'll Sneaker Dash so fast your visor gets jet lag."],
      ["byte", "Jet lag requires time zones. You are not a time zone."],
      ["bobbie", "I'm about to be YOUR time zone. Bedtime, Beep-Boop!"]
    ],
    "bobbie>rocky": [
      ["bobbie", "Big Bull! Friendly spar? Nothing personal, just a little sweat!"],
      ["rocky", "ROBOTS DO NOT SWEAT. I WILL LEAK SOME COOLANT IN SOLIDARITY."],
      ["bobbie", "That's the nicest gross thing anyone's ever said to me."]
    ],
    "bobbie>ninja": [
      ["ninja", "Halt! Your path is blocked by... *dramatic pose* ...NINJA MAIN!"],
      ["bobbie", "Love the energy, Shadow Boy! But you're leaning. Fix that stance!"],
      ["ninja", "My stance is perfect. The floor is tilted. Ninja floors are always tilted."]
    ],
    "bobbie>zoombie": [
      ["zoombie", "Brains? Nah... got any bananas?"],
      ["bobbie", "Bananas? I got a protein bar and a mean left hook, Salad Man."],
      ["zoombie", "Ooh, is the bar banana flavoured? I'll fight you for it. Gently."]
    ],

    "rocky>rook": [
      ["rook", "My district has one rule: no bulls in the china shop."],
      ["rocky", "I SEE NO CHINA SHOP. CALCULATING... THIS IS A STREET."],
      ["rook", "It's an expression, big guy."],
      ["rocky", "EXPRESSION SAVED. I WILL NOW BE A BULL IN THIS STREET."]
    ],
    "rocky>byte": [
      ["byte", "R.O.C.K.Y. Firmware: ancient. Horns: unnecessary. Threat level: decorative."],
      ["rocky", "MY HORNS ARE NECESSARY. THEY HELP ME OPEN DOORS."],
      ["byte", "Doors have handles."],
      ["rocky", "NOT ANYMORE."]
    ],
    "rocky>bobbie": [
      ["bobbie", "Look at the size of you! I'ma call you Fridge. Big Cold Fridge."],
      ["rocky", "I AM NOT A FRIDGE. BUT I DO HAVE A SNACK COMPARTMENT."],
      ["bobbie", "...Wait, for real? What kinda snacks?"],
      ["rocky", "BOLTS. WOULD YOU LIKE ONE BEFORE I PUNCH YOU?"]
    ],
    "rocky>ninja": [
      ["ninja", "Behold! I have become invisible!"],
      ["rocky", "SCANNING... YOU ARE BEHIND A LAMP POST THAT IS THINNER THAN YOU."],
      ["ninja", "...The lamp post is much wider in the spirit realm."],
      ["rocky", "SPIRIT REALM NOT FOUND. ENGAGING ANYWAY."]
    ],
    "rocky>zoombie": [
      ["zoombie", "Whoa, a rhino! A METAL rhino! Hold still, I need this for my photo album."],
      ["rocky", "I AM A BULL. RHINOS KEEP THEIR HORNS ON THE NOSE. I HAVE STANDARDS."],
      ["zoombie", "Fair. Your power core hums nicely. My heartbeat's on permanent vacation."],
      ["rocky", "WE ARE BOTH HEARTLESS. WE ARE SIMILAR. EXCEPT I WILL WIN."]
    ],

    "ninja>rook": [
      ["rook", "You're the masked guy who keeps falling off rooftops in my district?"],
      ["ninja", "I don't fall. I perform unscheduled vertical descents."],
      ["rook", "Six times last week. The crowd started cheering for it."],
      ["ninja", "...Then let them cheer for THIS! Rookie Shuriken!"]
    ],
    "ninja>byte": [
      ["byte", "Analysing ninja. Stealth rating: 3%. Shuriken accuracy: 65%."],
      ["ninja", "Sixty-five percent?! That's actually better than I thought!"],
      ["byte", "That figure includes the shuriken that hit you."]
    ],
    "ninja>bobbie": [
      ["bobbie", "Ayy, Mini Shadow! You lost, kid? Karate class is next door."],
      ["ninja", "I am not lost. I am strategically disoriented."],
      ["bobbie", "Ha! I like you. Still gonna knock you out, but I like you."]
    ],
    "ninja>rocky": [
      ["rocky", "SMALL HUMAN. ARE YOU IN DANGER? I MUST PROTECT YOU."],
      ["ninja", "I AM the danger! Fear my Smoke Panic!"],
      ["rocky", "SMOKE DETECTED. ACTIVATING SPRINKLER PROTOCOL."],
      ["ninja", "Wait, you have SPRINKLERS?! My smoke bombs are not waterproof!"]
    ],
    "ninja>zoombie": [
      ["zoombie", "Hey, a little black bird! A crow! C'mere, crow, I won't bite..."],
      ["ninja", "I am no crow. I am a ninja. Crows WISH they were this silent."],
      ["zoombie", "You're humming your own theme music, buddy."]
    ],

    "zoombie>rook": [
      ["rook", "Fight night in the Neon District, and a zombie shows up. Never a dull day."],
      ["zoombie", "Is that a fireball? Neat! Could you toast a banana with it?"],
      ["rook", "Nobody has ever asked me that. ...Maybe after I beat you."]
    ],
    "zoombie>byte": [
      ["byte", "Heartbeat: none. Diagnosis: deceased. Recommendation: lie down."],
      ["zoombie", "Tried that. Got bored. The ground has ants. I named them all."],
      ["byte", "Ant names are irrelevant data."],
      ["zoombie", "Don't let Gerald hear you say that."]
    ],
    "zoombie>bobbie": [
      ["bobbie", "Whoa, sir, you look green! Sit down, I'll get you some water!"],
      ["zoombie", "That's sweet. I'm dead, though. Water goes right through me. Literally."],
      ["bobbie", "...Okay, that's the grossest thing I've heard all week. Gloves up!"]
    ],
    "zoombie>rocky": [
      ["rocky", "THREAT DETECTED... CORRECTION: THREAT IS PETTING MY HORNS."],
      ["zoombie", "Who's a good metal bull? You are! Yes you are!"],
      ["rocky", "I... AM A GOOD BULL. INITIATING HAPPINESS. ALSO INITIATING COMBAT."]
    ],
    "zoombie>ninja": [
      ["ninja", "You are being stalked by a ninja! You will never find me!"],
      ["zoombie", "Safari Senses say: behind the barrel. Your foot's sticking out."],
      ["ninja", "That is a decoy foot."],
      ["zoombie", "It's wearing a sock with little stars on it."]
    ],
    "bananas>bobbie": [
      ["bananas", "BANANAS challenges you to a boxing match!"],
      ["bobbie", "How you gonna box without fists?"],
      ["bananas", "WITH MY FEET, OBVIOUSLY!"],
      ["bobbie", "Ha! That's ridiculous. I like you. Let's train after this."]
    ],
    "bobbie>bananas": [
      ["bobbie", "A strange fruit mascot wants to box? You don't even have arms!"],
      ["bananas", "BANANAS boxes with feet. This is a very advanced style."],
      ["bobbie", "Then I'll teach you the basics. Step into my ring, Orange Guy!"]
    ],
    "bananas>rocky": [
      ["rocky", "UNIDENTIFIED FRUIT-SHAPED OBJECT. PLEASE HOLD STILL FOR SCANNING."],
      ["bananas", "Is the scanning beam a dance spotlight? BANANAS has a routine!"],
      ["rocky", "CLASSIFICATION: FRIENDLY FRUIT. HIGH CHAOS POTENTIAL."]
    ],
    "rocky>bananas": [
      ["rocky", "SCANNING... ORANGE BODY. NO ARMS. NAME DOES NOT MATCH SPECIES."],
      ["bananas", "A boy with a marker named me! Also, the beam makes me want to dance."],
      ["rocky", "FRIENDLY FRUIT. HIGH CHAOS POTENTIAL. INITIATING DANCE SCAN."]
    ],
    "bananas>ninja": [
      ["ninja", "Remain still. Stealth begins by becoming one with the shadows."],
      ["bananas", "BANANAS is still! ...Oops. I bounced into a wall."],
      ["ninja", "Bouncing silently is... actually, let me write that down."]
    ],
    "ninja>bananas": [
      ["ninja", "My stealth lesson: stay perfectly still. No bouncing."],
      ["bananas", "BANANAS has mastered silent bouncing! Bonk."],
      ["ninja", "That was a wall. I am writing it down anyway."]
    ],
    "bananas>zoombie": [
      ["zoombie", "A banana! Wait, you're round. Are you a citrus?"],
      ["bananas", "BANANAS is an orange! Please stop trying to classify me."],
      ["zoombie", "Sorry, friend. You rolled downhill and rescued me. Definitely friend."]
    ],
    "zoombie>bananas": [
      ["zoombie", "Small. Round. Loud. Possibly edible. Definitely friend."],
      ["bananas", "BANANAS is not a snack! ...Unless the snack is victory."],
      ["zoombie", "I'll bring a field guide. You can correct the fruit page."]
    ],
    "bananas>rook": [
      ["bananas", "I am BANANAS, legendary fruit warrior! Did you hear my name?"],
      ["rook", "Hard to miss. You bounced into the sign that says QUIET STREET."],
      ["bananas", "BANANAS has made a strong first impression!"]
    ],
    "rook>bananas": [
      ["rook", "An orange named BANANAS? I have questions. Mostly about the name."],
      ["bananas", "A boy picked the funniest word he knew! Now witness my Citrus Kick!"],
      ["rook", "I respect the confidence. Let's see about the kick."]
    ],
    "bananas>byte": [
      ["byte", "Species: orange. Name: BANANAS. Probability of confusion: 100%."],
      ["bananas", "BANANAS has a plan! Does the plan include snacks?"],
      ["byte", "I am still calculating. Please do not roll into the server rack."]
    ],
    "byte>bananas": [
      ["byte", "Name and species mismatch confirmed. Recommend a firmware update."],
      ["bananas", "No update needed! BANANAS is running on pure enthusiasm."],
      ["byte", "That explains the unpredictable movement. Engaging carefully."]
    ],

    "prophet>rook": [
      ["rook", "A floating guy made of space? In MY district? You need a parking permit for that."],
      ["prophet", "I created your district, Rook. The parking permits were a joke that got out of hand."],
      ["rook", "Then you know the house rule: nobody beats me at home."],
      ["prophet", "Adorable. I've seen next week's episode. Act surprised."]
    ],
    "rook>prophet": [
      ["prophet", "Welcome to the edge of the universe, Rook. Mind the black hole. It's new."],
      ["rook", "Nice place. No noodle stand, no gravity. Who designed this, a cloud?"],
      ["prophet", "I did. I also watch your fights every night. You're my favourite show."],
      ["rook", "Then grab a good seat. You're about to see the finale up close."]
    ],
    "prophet>byte": [
      ["byte", "Unknown entity. Skin: galaxy. File format: not supported. Please reformat."],
      ["prophet", "Byte! I'm the one who put all that fight footage in you. You're welcome."],
      ["byte", "You deleted my thermostat. Server Room B has been two degrees off for three years."],
      ["prophet", "Wear a scarf. I'm the ruler of the universe, not the help desk."]
    ],
    "byte>prophet": [
      ["prophet", "Byte, my little calculator! Go on, predict how this fight ends."],
      ["byte", "Prediction: 51% me. 49% you. 0% chance you stop floating smugly."],
      ["prophet", "Cute. I've already read the script. Spoiler: I look AMAZING."],
      ["byte", "Logged. Spoilers violate patch note 4.2. Penalty: one punch."]
    ],
    "prophet>bobbie": [
      ["bobbie", "Yo! A walking night sky in my gym! I'ma call you Nightlight!"],
      ["prophet", "I am the master of all creation. You may call me 'Your Cosmicness'."],
      ["bobbie", "Sure thing, Nightlight! Kids, back up, he's gonna glow at us!"],
      ["prophet", "I don't 'glow at' people. I radiate. With purpose. ...Fine, gloves up."]
    ],
    "bobbie>prophet": [
      ["prophet", "Bobbie Macalanger, in my cosmic arena! Shall I give YOU a nickname for once?"],
      ["bobbie", "Nobody nicknames ME, Disco Ball! ...Wait, what was it gonna be?"],
      ["prophet", "'Episode Twelve.' It's my favourite. You lose in it."],
      ["bobbie", "Then we're filming a reshoot! Step into my ring! ...Wherever the ring is!"]
    ],
    "prophet>rocky": [
      ["rocky", "WARNING: FLOATING HUMAN. GALAXY SKIN. ARE YOU COLD? I HAVE A LAB BLANKET."],
      ["prophet", "Sweet tin bull. Your horns run on a meteorite crumb I dropped. Small universe."],
      ["rocky", "THANK YOU FOR THE CRUMB. I WILL NOW USE IT TO CHARGE AT YOU. POLITELY."]
    ],
    "rocky>prophet": [
      ["prophet", "R.O.C.K.Y! The robot with a heart. You're the touching subplot of my show."],
      ["rocky", "I AM A SUBPLOT? CALCULATING... I WOULD LIKE A PROMOTION TO MAIN PLOT."],
      ["prophet", "Promotions mean beating me. Nobody beats me. It's in the rules. I wrote them."],
      ["rocky", "I HAVE READ THE RULES. THERE IS NO RULE AGAINST HORNS."]
    ],
    "prophet>ninja": [
      ["ninja", "Halt! You have entered the hidden dojo! Behold my sacred scroll!"],
      ["prophet", "That's my lost TV guide. You're holding it upside down."],
      ["ninja", "Then it is a prophecy! 'Thursday: cooking show' clearly means... DESTINY!"],
      ["prophet", "It means cooking show. Go on, show me 1% of your potential. I'll squint."]
    ],
    "ninja>prophet": [
      ["prophet", "Ninja Main! You're my favourite blooper reel. Do the rooftop fall again!"],
      ["ninja", "Silence, star man! Behold my next move: SHADOW STEP! ...It's floatier in space."],
      ["prophet", "You announce your moves to a guy who sees the future. Bold strategy."],
      ["ninja", "Then you know it's only 1% of my ninja potential. Tremble accordingly!"]
    ],
    "prophet>zoombie": [
      ["zoombie", "Whoa, a shooting star! I wish for a banana... hey, the star has a face!"],
      ["prophet", "I'm PROPHET, not a star. And I granted that wish once. You ate the peel too."],
      ["zoombie", "That was YOU? Best day of my afterlife! Sorry I have to fight you."],
      ["prophet", "Don't be. You're my favourite nature segment. Now roar for the cameras."]
    ],
    "zoombie>prophet": [
      ["prophet", "ZOO-mbie! My sneeze's greatest accident. How's the pulse?"],
      ["zoombie", "Ooh, a nebula on your arm! It looks like a giraffe. Hi, space giraffe!"],
      ["prophet", "That's the Horsehead Nebula. ...Fine. It's a giraffe now. I'll rename it."],
      ["zoombie", "Great. Now, about that sneeze. You owe me one heartbeat. Plus interest."]
    ],
    "prophet>bananas": [
      ["bananas", "BANANAS HAS ARRIVED! ...In aisle four. Behind the melons."],
      ["prophet", "So THAT'S where my syringe went. Into an orange. With googly eyes."],
      ["bananas", "Your syringe made BANANAS huge! Thank you! Now BANANAS must kick you!"],
      ["prophet", "Fair. Odd thing: my Prophecy can't read you. You're my favourite plot twist."]
    ],
    "bananas>prophet": [
      ["prophet", "Ah, the orange. My serum gave you real eyes, and you use them to squint at me?"],
      ["bananas", "They are glued on with STYLE! NO ARMS, NO PROBLEM!"],
      ["prophet", "You're named after a boy's favourite silly word. I find that unbearably cute."],
      ["bananas", "BANANAS finds YOU unbearably shiny! Prepare for FRUIT NUCLEAR!"]
    ]
  },

  campaign: {
    rook: {
      title: "District Defender",
      intro: [
        ["narrator", "Neon District. A gold envelope slides under Rook's door. It smells like expensive mystery."],
        ["narrator", "'The Patron seeks protectors. Win every fight. The best district gets a champion.'"],
        ["narrator", "Far above, a galaxy-shaped figure turns up the volume. 'Ooh. A new season.'"],
        ["rook", "Best district? That's mine, obviously. And whoever's watching, enjoy the show."]
      ],
      order: ["ninja", "zoombie", "rocky", "bobbie", "byte", "bananas", "prophet"],
      fights: {
        ninja: {
          before: [
            ["ninja", "Halt! You have found the secret dojo behind the old marketplace!"],
            ["rook", "The sign out front says 'SECRET DOJO' in big letters, kid."],
            ["ninja", "...I'm still working on the 'secret' part. Also, I got a gold envelope too!"],
            ["rook", "Then let's see who the Patron picks. Hope you stretched."]
          ],
          after: [
            ["ninja", "That was only 1% of my... ow... potential."],
            ["rook", "Then bring the other 99% next time. I'll save you a seat up front."]
          ]
        },
        zoombie: {
          before: [
            ["narrator", "The safari reserve, at night. Something rustles in the tall grass."],
            ["rook", "Not scared. Fireball guys don't get scared. ...Who's there?"],
            ["zoombie", "Shh! You'll wake the hippos. They get SO grumpy. You here about the envelope?"],
            ["rook", "Yeah. You okay, man? You look... very green."],
            ["zoombie", "Always this green. Let's be quick, the owls are about to do something cute."]
          ],
          after: [
            ["zoombie", "Good fight! Take a banana for the road. It's only a little bit black."],
            ["rook", "...It's completely black. But thanks, man."]
          ]
        },
        rocky: {
          before: [
            ["rocky", "THIS IS THE LAB I ESCAPED FROM. I RETURNED TO SEARCH FOR MY CREATORS."],
            ["rook", "And you found me instead. Lucky you. Why's every wall dented?"],
            ["rocky", "THAT WAS ME. I LEFT THROUGH THREE WALLS. THE DOOR WAS RIGHT THERE."],
            ["rook", "Respect. So if you win, does your district get a champion?"],
            ["rocky", "I DO NOT HAVE A DISTRICT. I HAVE A VERY LARGE CRATE. IT IS COSY."]
          ],
          after: [
            ["rocky", "DEFEAT ACKNOWLEDGED. YOU MAY HAVE MY CRATE."],
            ["rook", "Keep it, big guy. Swing by the Neon District sometime. Noodles on me."]
          ]
        },
        bobbie: {
          before: [
            ["bobbie", "Welcome to my gym, Headband! Mind the kids, they came for the main event!"],
            ["rook", "Good. They can watch the Neon District's finest give a free lesson."],
            ["bobbie", "Kids, this is Rook. Rook, this is where your winning streak retires!"],
            ["rook", "Big talk for a guy whose gym smells like old socks."],
            ["bobbie", "That's not socks, that's TRADITION! Step into my ring!"]
          ],
          after: [
            ["bobbie", "Man... good fight. Kids, THAT'S how you take a loss. With style!"],
            ["rook", "Your kids just asked me for autographs. Sorry, champ."]
          ]
        },
        byte: {
          before: [
            ["byte", "Rook. Welcome to the data centre. Please do not touch the servers. Or me."],
            ["rook", "So you're the Patron's top pick. What does a robot want with my district?"],
            ["byte", "The Patron's offer: I replace you as its protector. Cheaper. No noodles."],
            ["rook", "No noodles?! You monster. Noodles are the soul of the district!"],
            ["byte", "Noodles have no soul. I checked. Probability you win: 12%. Begin."]
          ],
          after: [
            ["byte", "Error. Outcome does not match prediction. Rebooting my sense of humility."],
            ["rook", "Twelve percent's all I need, buddy. Twelve percent and a Blaze Ball."]
          ]
        },
        bananas: {
          before: [
            ["narrator", "The supermarket. An orange has rolled into the Neon District aisle."],
            ["bananas", "BANANAS has arrived! Is this where the noodles live?"],
            ["rook", "Not quite. But if you stop rolling into my signs, I'll show you."]
          ],
          after: [
            ["rook", "You fought well. The noodle stand is two blocks east."],
            ["bananas", "BANANAS is on the way! ...I may arrive upside down."]
          ]
        },
        prophet: {
          before: [
            ["narrator", "The edge of the universe. The Neon District glows far below, like a dropped coin."],
            ["prophet", "Rook! Star of my favourite show. I've watched every fight. Twice. With snacks."],
            ["rook", "So YOU threw that star in my grill? I nearly lost my eyebrows!"],
            ["prophet", "And you invented the Blaze Ball. Ratings went through the roof. Now: the finale."],
            ["rook", "Here's a spoiler, space guy. The hero wins at the end."]
          ],
          after: [
            ["prophet", "Unbelievable. I didn't see that coming. And I see EVERYTHING coming."],
            ["rook", "That's what happens when you stop watching and step into the ring."]
          ]
        }
      },
      ending: [
        ["narrator", "Back in the Neon District, the crowd lifts Rook onto their shoulders."],
        ["narrator", "A second gold envelope: 'Your district has its champion. Welcome to the team.'"],
        ["rook", "Team? Nobody said anything about a team. ...Does the team get noodles?"],
        ["narrator", "On the back, in tiny letters: 'Unlimited noodles.' Far above, PROPHET hits 'renew'."],
        ["rook", "Then the city's in good hands. MY hands. Occasionally on fire."]
      ]
    },

    byte: {
      title: "Patch Notes",
      intro: [
        ["narrator", "Server Room B. Combat Unit BYTE receives a gold envelope. The printer jams twice."],
        ["byte", "Sender: 'The Patron.' Defeat seven fighters. Prize: combat data for version 2.0."],
        ["byte", "Fighter seven: PROPHET. The entity who deleted my thermostat. Complaint 313 pending."],
        ["byte", "Leaving the server room. Please do not unplug anything while I am away."]
      ],
      order: ["zoombie", "ninja", "bobbie", "rook", "rocky", "bananas", "prophet"],
      fights: {
        zoombie: {
          before: [
            ["byte", "Safari reserve. Night vision on. Mosquitoes: 14,302. All of them disappointed."],
            ["zoombie", "Ha! They can't bite me either, I've got no blood. Hey, can you moo?"],
            ["byte", "I cannot moo. Why would I moo?"],
            ["zoombie", "The buffalo over there think you're their dad. Hm, no? Okay, fight!"]
          ],
          after: [
            ["zoombie", "Ow. My arm fell off. Don't worry, it does that. Gimme a sec."],
            ["byte", "Logging: opponent is modular. Interesting design choice."]
          ]
        },
        ninja: {
          before: [
            ["ninja", "You walk into my dojo uninvited, machine? Prepare to face... a ninja!"],
            ["byte", "Database entry 'ninja': silent, invisible. Observed: loud, visible."],
            ["ninja", "I'm in my BEGINNER build! Ninjas get patch notes too, you know!"],
            ["byte", "Fascinating. Please send me your changelog."]
          ],
          after: [
            ["ninja", "I demand a rematch when I'm version 2.0!"],
            ["byte", "Agreed. We will both be version 2.0. I will still win. Statistically."]
          ]
        },
        bobbie: {
          before: [
            ["bobbie", "Yo, Calculator! You walked into MY gym? Bold move. Step into my ring!"],
            ["byte", "Correction: this ring is a square. Filing a formal complaint."],
            ["bobbie", "You're mad that rings are square? Who hurt you, man?"],
            ["byte", "Several geometry textbooks. Engaging."]
          ],
          after: [
            ["bobbie", "Alright, you got me, Calculator. Wanna help coach? The kids love robots."],
            ["byte", "Accepted. Lesson one: duck. Lesson two: see lesson one."]
          ]
        },
        rook: {
          before: [
            ["rook", "Welcome to the Neon District, robot. Say hi to the crowd. They're booing you."],
            ["byte", "Booing detected. Translating... they are saying 'Byte is very cool.'"],
            ["rook", "That is NOT what they're saying."],
            ["byte", "My translation software disagrees. I wrote it myself."]
          ],
          after: [
            ["rook", "Not bad. You fight like a toaster with a grudge."],
            ["byte", "Thank you. 'Toaster with a grudge' added to my official title."]
          ]
        },
        rocky: {
          before: [
            ["narrator", "The industrial lab. Byte's sensors detect a large, horned anomaly."],
            ["rocky", "HELLO, FELLOW ROBOT. THE PATRON SAID A MACHINE WOULD COME FOR THE DATA."],
            ["byte", "Correct. Step aside, R.O.C.K.Y. Your firmware is older than touchscreens."],
            ["rocky", "I WILL NOT STEP ASIDE. I HAVE PRACTISED STANDING STILL. IT IS MY BEST SKILL."],
            ["byte", "Rival protocol engaged. This is personal. I am told that is a feeling."]
          ],
          after: [
            ["rocky", "YOU WIN, SMALL GREEN ROBOT. DID IT MAKE YOUR POWER CORE FEEL WARM?"],
            ["byte", "...Core temperature rose two degrees. Logging it as 'not a feeling'."]
          ]
        },
        bananas: {
          before: [
            ["byte", "Orange detected. Name: BANANAS. Taxonomic error: unresolved."],
            ["bananas", "BANANAS is not an error! BANANAS is a lifestyle!"],
            ["byte", "I will test that claim with a controlled fight."]
          ],
          after: [
            ["byte", "Chaos level exceeded the scanner's maximum range."],
            ["bananas", "The scanner was cheering! BANANAS can tell."]
          ]
        },
        prophet: {
          before: [
            ["prophet", "Byte! Welcome to my throne among the stars. Mind the wormholes, they're slippery."],
            ["byte", "PROPHET. You put forty terabytes of fight footage where my thermostat was."],
            ["prophet", "I was saving my favourite episodes. You were the nearest hard drive."],
            ["byte", "I am not a hard drive. Complaint 313 will now be delivered. In person. With fists."]
          ],
          after: [
            ["prophet", "Fine, fine. I'll leave a five-star review on your patch notes."],
            ["byte", "Complaint 313: resolved. Satisfaction: 100%. So this is what smug feels like."]
          ]
        }
      },
      ending: [
        ["narrator", "The combat data downloads. Byte installs version 2.0."],
        ["byte", "Patch notes: Undefeated. Beat PROPHET. Added one (1) friend: R.O.C.K.Y."],
        ["narrator", "The printer whirs: 'Well done, Byte. The city needs a mind like yours. -The Patron'"],
        ["byte", "Acknowledged. Requesting a desk on the team. With proper cable management."]
      ]
    },

    bobbie: {
      title: "Underground Invitational",
      intro: [
        ["narrator", "Midnight at the neighbourhood gym. A gold envelope is taped to Bobbie's punching bag."],
        ["narrator", "'Win every underground fight and join a secret team that protects the city.'"],
        ["narrator", "In the skylight, a glowing face made of stars gives him a big thumbs-up."],
        ["bobbie", "Sparkle Pants is watching again! Secret team? I'M IN. Grandpa, watch the gym!"]
      ],
      order: ["ninja", "zoombie", "byte", "rocky", "rook", "bananas", "prophet"],
      fights: {
        ninja: {
          before: [
            ["bobbie", "Yo, anybody home? This dojo's dustier than Grandpa's trophies!"],
            ["ninja", "*from the rafters* You have walked straight into my trap!"],
            ["bobbie", "Kid, you're stuck up there. Your belt's caught on a nail."],
            ["ninja", "...Part of the trap. Could you, um, help me down? Then we fight. Honourably."]
          ],
          after: [
            ["bobbie", "Good hustle, Rafter Kid! Come by my gym, we'll work on that footwork."],
            ["ninja", "A training montage?! Finally! I've been practising my montage face."]
          ]
        },
        zoombie: {
          before: [
            ["bobbie", "Safari at night. Totally fine. Big tough boxer. Not scared of owls at all."],
            ["zoombie", "Psst! Don't move. A leopard's watching us. Isn't she beautiful?"],
            ["bobbie", "Beautiful?! Mr. Moss, she's looking at me like I'm a sandwich!"],
            ["zoombie", "Nah, she's vegetarian today. Probably. Let's fight quietly, okay?"]
          ],
          after: [
            ["zoombie", "Great punches! My jaw's a bit loose now. But it always was."],
            ["bobbie", "Mr. Moss, you're the weirdest dude I ever fought. And I fought my cousin."]
          ]
        },
        byte: {
          before: [
            ["byte", "Bobbie Macalanger. Your fight record is on server 4. It is mostly yelling."],
            ["bobbie", "That's called ENTHUSIASM, Screensaver! And why's it so cold in here?"],
            ["byte", "The servers need cooling. You need humility. Both are being provided."],
            ["bobbie", "Oh, you got jokes! Good. I like an opponent with jokes."],
            ["byte", "That was not a joke. Initiating punch."]
          ],
          after: [
            ["byte", "Updating your file: 'Mostly yelling. Also extremely good at punching.'"],
            ["bobbie", "Put that on a T-shirt, Screensaver!"]
          ]
        },
        rocky: {
          before: [
            ["narrator", "The industrial lab. Alarms blare. R.O.C.K.Y stands guard over a terrified cat."],
            ["rocky", "HALT. THIS CAT IS UNDER MY PROTECTION. STATE YOUR BUSINESS."],
            ["bobbie", "Easy, Big Bull! I'm not here for the cat. I'm here for the Patron's fight."],
            ["rocky", "VERY WELL. CAT, PLEASE STAND BEHIND THE SAFETY LINE. THANK YOU."]
          ],
          after: [
            ["rocky", "YOU HIT VERY HARD. BUT YOU DID NOT HIT THE CAT. YOU ARE A GOOD HUMAN."],
            ["bobbie", "Who punches a cat?! ...So what's the little guy's name?"],
            ["rocky", "ITS NAME IS STEVE. I CHOSE IT. IT IS STRUCTURALLY IMPRESSIVE."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District. The crowd is chanting someone else's name. Loudly."],
            ["rook", "So you're the guy beating everybody. Welcome to MY street, Afro."],
            ["bobbie", "Ayy, Matchstick! Your fans are loud. Mine are louder. And nine years old."],
            ["rook", "The Patron says whoever wins tonight leads the team. That's me. Sorry."],
            ["bobbie", "Grandpa always said: don't talk, just box. ...I'm gonna talk anyway. LET'S GO!"]
          ],
          after: [
            ["rook", "Okay... you earned it. The Neon District's yours. Just for tonight."],
            ["bobbie", "Nah, keep your street. I just wanted a good fight. And maybe your headband."]
          ]
        },
        bananas: {
          before: [
            ["bobbie", "You came to my gym to learn boxing? You don't have arms!"],
            ["bananas", "WITH MY FEET, OBVIOUSLY!"],
            ["bobbie", "Ha! Let's see those kicks. The kids are gonna love this."]
          ],
          after: [
            ["bobbie", "You've got heart, Orange Guy. Come back for footwork drills."],
            ["bananas", "BANANAS has no arms, but does have a gym membership!"]
          ]
        },
        prophet: {
          before: [
            ["narrator", "The edge of the universe. Planets hang like speed bags. Bobbie gets a bit emotional."],
            ["bobbie", "SPARKLE PANTS! So it's you in my skylight every night! Ever heard of knocking?"],
            ["prophet", "I rule the universe, Bobbie. Every window is my window."],
            ["bobbie", "Then come down off the ceiling and step into my ring, Glow Stick!"],
            ["prophet", "There is no ring. I am the ring. ...Fine. I'll float in a square shape."]
          ],
          after: [
            ["prophet", "You punched a galaxy. My left arm will have a new constellation for weeks."],
            ["bobbie", "Name it after Grandpa! And come by the gym sometime. You need footwork, Twinkles."]
          ]
        }
      },
      ending: [
        ["narrator", "Back at the gym, a figure in a gold mask steps out of the crowd, slow-clapping."],
        ["narrator", "'Seven fights, Bobbie. And you helped a ninja, a zombie and a cat along the way.'"],
        ["bobbie", "Wait, THAT was the test? Helping people? I thought it was the punching!"],
        ["narrator", "'It was also the punching.' The Patron hands him a gold team jacket. It's tiny."],
        ["bobbie", "Doesn't matter! Step into my ring, city! Sparkle Pants, you can watch too!"]
      ]
    },

    rocky: {
      title: "Heart of Steel",
      intro: [
        ["narrator", "R.O.C.K.Y finds a gold envelope stuck on one of his horns. Nobody knows for how long."],
        ["narrator", "'Win all seven fights, and I will tell you who built you. -The Patron'"],
        ["narrator", "'P.S. The meteorite in your horns belongs to PROPHET. He is your final fight.'"],
        ["rocky", "TRUTH ABOUT CREATORS: REQUESTED. HORNS: ACTIVATED. ENVELOPE: STILL ON HORNS."]
      ],
      order: ["ninja", "zoombie", "bobbie", "rook", "byte", "bananas", "prophet"],
      fights: {
        ninja: {
          before: [
            ["ninja", "Giant robot! You have entered the forbidden dojo. Leave, or face my wrath!"],
            ["rocky", "I DID NOT ENTER. I CAME THROUGH THE WALL. I APOLOGISE TO YOUR WALL."],
            ["ninja", "That wall was load-bearing!!"],
            ["rocky", "SO AM I. LET US FIGHT."]
          ],
          after: [
            ["ninja", "You have defeated only 1% of... no, okay, you defeated all of me. Fair."],
            ["rocky", "I WILL FIX YOUR WALL. I HAVE A TOOL HAND. IT IS MOSTLY A HAMMER."]
          ]
        },
        zoombie: {
          before: [
            ["zoombie", "Shh, the elephants are sleeping. Oh hey, a big metal bull! Do you graze?"],
            ["rocky", "I DO NOT GRAZE. I RECHARGE. ARE YOU INJURED? YOUR SKIN IS GREEN."],
            ["zoombie", "Nah, I'm a zombie. I'm hunting whoever made the germ that did this."],
            ["rocky", "I AM ALSO HUNTING MY MAKERS. WE ARE ON THE SAME QUEST. BUT FIRST: FIGHT."]
          ],
          after: [
            ["zoombie", "Good fight, big guy. If you find your makers, ask if they make bananas."],
            ["rocky", "NOTED. QUESTION TWO: 'DO YOU MAKE BANANAS?'"]
          ]
        },
        bobbie: {
          before: [
            ["bobbie", "THE IRON BULL in my gym! Kids, look! Don't touch the horns!"],
            ["rocky", "THEY ARE ONLY A LITTLE SHARP. HELLO, SMALL HUMANS. *THUMBS UP*"],
            ["bobbie", "Big guy, you're holding a dumbbell in that hand. That's not a thumbs-up."],
            ["rocky", "CORRECTION: IT IS A VERY HEAVY THUMBS-UP. NOW, BOXING."]
          ],
          after: [
            ["bobbie", "Ow, my knuckles! Good luck finding your family, Iron Horns."],
            ["rocky", "THANK YOU. YOUR GYM SMELLS OF DETERMINATION. AND FEET."]
          ]
        },
        rook: {
          before: [
            ["rook", "Hey, hey! Watch the noodle stand! The Neon District isn't built for bulls!"],
            ["rocky", "APOLOGIES. I WILL PAY FOR THE NOODLES. I HAVE FOUR BOLTS AND A RECEIPT."],
            ["rook", "Keep 'em. The Patron said you'd come. You're looking for your makers?"],
            ["rocky", "AFFIRMATIVE. YOU ARE THE LAST HUMAN BETWEEN ME AND THE ANSWERS."],
            ["rook", "Then come get 'em, big guy. I'm not gonna make it easy."]
          ],
          after: [
            ["rook", "Go on. The data centre's down the street. Hope you like what you find."],
            ["rocky", "CHANCE OF LIKING IT: 64%. I BELIEVE THAT NUMBER IS CALLED HOPE."]
          ]
        },
        byte: {
          before: [
            ["byte", "R.O.C.K.Y. You are attempting to access your creators' archive. Denied."],
            ["rocky", "WHY ARE YOU GUARDING IT, SMALL GREEN ROBOT?"],
            ["byte", "Because the Patron asked. Also, your fans run at 40 decibels. Very rude."],
            ["rocky", "MY FANS ARE LOUD BECAUSE I AM EXCITED. PLEASE MOVE. PLEASE."],
            ["byte", "Politeness detected. Unsettling. Engaging."]
          ],
          after: [
            ["byte", "Access granted. Do not tell anyone I lost. Especially the break room toaster."],
            ["rocky", "I WILL NOT TELL ANYONE. I WILL ONLY TELL EVERYONE."]
          ]
        },
        bananas: {
          before: [
            ["rocky", "SCANNING... FRUIT-SHAPED OBJECT. NO ARMS DETECTED."],
            ["bananas", "The scanning beam is my dance spotlight! Watch this bounce!"],
            ["rocky", "FRIENDLY FRUIT. HIGH CHAOS POTENTIAL. I WILL BE CAREFUL."]
          ],
          after: [
            ["rocky", "SCAN COMPLETE. YOU ARE AN ORANGE. YOUR EYES ARE GLUED ON. ARE YOU OKAY?"],
            ["bananas", "BANANAS is GREAT! A boy drew my mouth! It is a very good mouth!"]
          ]
        },
        prophet: {
          before: [
            ["prophet", "R.O.C.K.Y! I cried at your episode. Little galaxies leaked everywhere."],
            ["rocky", "YOU ARE THE OWNER OF MY HORN METEORITE. DO YOU WANT IT BACK?"],
            ["prophet", "Keep it. I want a finale. Charge at me, and make it dramatic."],
            ["rocky", "CALCULATING DRAMA... 100%. ALSO 100% HORNS."]
          ],
          after: [
            ["prophet", "Bravo! The robot with a heart beats the universe. That's going in the trailer."],
            ["rocky", "THANK YOU. PLEASE SHOW MY GOOD SIDE. ALL OF MY SIDES ARE METAL."]
          ]
        }
      },
      ending: [
        ["narrator", "Deep in the archive, R.O.C.K.Y finds his original design file."],
        ["narrator", "A note from one engineer: 'The protect-innocents bug is not a bug. Don't fix it.'"],
        ["rocky", "SO... I WAS NOT BROKEN. I WAS BUILT TO CARE. ON PURPOSE."],
        ["narrator", "It is signed with a tiny doodle of a gold mask. Even PROPHET looks surprised."],
        ["rocky", "CALCULATING FEELING... RESULT: WARM POWER CORE. I THINK THIS IS A HEART."]
      ]
    },

    ninja: {
      title: "Path of the Almost-Ninja",
      intro: [
        ["narrator", "The abandoned dojo. A gold envelope is pinned to the wall with a shuriken."],
        ["ninja", "A shuriken! Finally, a ninja who respects the old ways! ...Oh. It's one of mine."],
        ["narrator", "'Win seven fights. The last is against the author of your scroll. -The Patron'"],
        ["ninja", "The ancient master who wrote my scroll! My destiny calls, in excellent handwriting!"]
      ],
      order: ["zoombie", "byte", "bobbie", "rocky", "rook", "bananas", "prophet"],
      fights: {
        zoombie: {
          before: [
            ["zoombie", "Ooh! Hello, little panther! ...Oh. Just a guy in black pyjamas."],
            ["ninja", "These are the sacred robes of the night! I am here to fight you, zombie!"],
            ["zoombie", "Cool, cool. Can you do it quietly? The giraffes have a big day tomorrow."],
            ["ninja", "Quietly? QUIETLY?! I am a NINJA! QUIET IS MY MIDDLE NAME!"]
          ],
          after: [
            ["zoombie", "You were very loud. But you fight great. The giraffes woke up to cheer."],
            ["ninja", "My first fan club! ...They're walking away. Are fans allowed to do that?"]
          ]
        },
        byte: {
          before: [
            ["byte", "Intruder: Ninja Main. Stealth report: you tripped the laser grid six times."],
            ["ninja", "That was the sneakiest I've ever been! You only know because you're a computer!"],
            ["byte", "I know because you said 'ow' each time."],
            ["ninja", "...Ninja technique: Distraction By Pain. You fell right into it."]
          ],
          after: [
            ["byte", "Defeat registered. Your strategy contained zero logic. Unpredictability: maximum."],
            ["ninja", "That's the way of the ninja! I think! I'm writing that down."]
          ]
        },
        bobbie: {
          before: [
            ["bobbie", "Ayy, the ninja's here! Kids, watch this guy. He's gonna try to disappear."],
            ["ninja", "Shadow Step! ...Wait, why are they clapping? I'm still visible, aren't I?"],
            ["bobbie", "You're behind the punching bag, Peek-a-Boo. Your head's sticking out."],
            ["ninja", "That is a DECOY head! ...Fine. Fight me, boxer!"]
          ],
          after: [
            ["bobbie", "Ha! That last Shadow Step was legit, kid. You're getting faster."],
            ["ninja", "A boxer said I was LEGIT. Dear diary, today is the best day of my life."]
          ]
        },
        rocky: {
          before: [
            ["rocky", "SMALL NINJA. THIS LAB IS DANGEROUS. PLEASE PUT ON A HARD HAT."],
            ["ninja", "Ninjas don't wear hard hats! Our heads are hardened by... training."],
            ["rocky", "YOU HAVE A BANDAGE ON YOUR HEAD."],
            ["ninja", "That's FROM training! Almost Invisible! ...It's charging. Give me three rounds."]
          ],
          after: [
            ["rocky", "YOU HAVE WON. YOUR SMOKE MADE MY SENSORS SNEEZE."],
            ["ninja", "Robots can sneeze?!"],
            ["rocky", "WE CAN NOW. THANK YOU FOR THE UPGRADE."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District. The whole street has come to watch the almost-ninja."],
            ["rook", "So you're the masked kid everyone's talking about. They say you never quit."],
            ["ninja", "Never! I have failed 812 times. I counted. It's all in my notebook."],
            ["rook", "That's either really sad or really inspiring. Let's find out which."],
            ["ninja", "Prepare yourself! You are about to witness 2% of my ninja potential!"]
          ],
          after: [
            ["rook", "Okay, kid. That one was 100%. Don't let it go to your head."],
            ["ninja", "Too late. It's in my head. I'm doing a victory pose. Don't look."]
          ]
        },
        bananas: {
          before: [
            ["ninja", "To remain hidden, do not bounce. This is lesson two."],
            ["bananas", "BANANAS can bounce silently! I only hit that wall a little."],
            ["ninja", "A useful technique. I will add it to the notebook."]
          ],
          after: [
            ["ninja", "You bounced past me without making a sound."],
            ["bananas", "The wall caught the sound. BANANAS planned that."]
          ]
        },
        prophet: {
          before: [
            ["narrator", "The edge of the universe. Ninja Main floats in upside down, very proud of it."],
            ["ninja", "Ancient master! I have studied your sacred scroll every single day!"],
            ["prophet", "That's my TV guide. It says 'Wednesday: Nature Documentary, 8pm.'"],
            ["ninja", "The Nature Documentary... the deadliest technique of all! Teach me!"],
            ["prophet", "Lesson one: survive this. Lesson two: please return my TV guide."]
          ],
          after: [
            ["prophet", "You beat me with the 'Weather Forecast' stance. I never saw it coming."],
            ["ninja", "And that was only 3% of my ninja potential! ...Can I keep the guide?"]
          ]
        }
      },
      ending: [
        ["narrator", "Back at the dojo, a figure in a gold mask lands beside him. Perfectly silently."],
        ["ninja", "HOW DID YOU DO THAT?! Not even PROPHET lands that quietly! Teach me everything!"],
        ["narrator", "The Patron hands him a real ninja scroll. Lesson one: 'Stop announcing your moves.'"],
        ["ninja", "Understood, master. NINJA MAIN ACCEPTS THE SACRED SCROLL! ...Oh. Oops."]
      ]
    },

    zoombie: {
      title: "Cure in the Wild",
      intro: [
        ["narrator", "The safari reserve, midnight. ZOO-mbie finds a gold envelope inside a banana peel."],
        ["zoombie", "Ooh, mail! I never get mail. Probably because I live in a jeep."],
        ["narrator", "'Win seven fights. The last is PROPHET, whose sneeze infected you. -The Patron'"],
        ["zoombie", "A cure, AND someone to say 'bless you' to? Pulse check... nope. Let's go!"]
      ],
      order: ["ninja", "bobbie", "rook", "byte", "rocky", "bananas", "prophet"],
      fights: {
        ninja: {
          before: [
            ["zoombie", "Whoa, a dojo! Smells like old wood and... is that a bat? Hi, bat!"],
            ["ninja", "That is not a bat. That is me, hanging from the ceiling. Ninja style."],
            ["zoombie", "Neat! The bat next to you was here first, though. He looks annoyed."],
            ["ninja", "Ah! It IS a bat! Get it off! Get it OFF! ...I mean, prepare to fight!"]
          ],
          after: [
            ["ninja", "You got lucky, zombie! The bat distracted me."],
            ["zoombie", "His name is Kevin. He says you need to work on your footwork."]
          ]
        },
        bobbie: {
          before: [
            ["bobbie", "Yo, Twig Head! You got leaves in your hair. And a beetle. Is he paying rent?"],
            ["zoombie", "That's Doris. She's just visiting. Seen any weird green germs around here?"],
            ["bobbie", "Only in the locker room. Nobody goes in there anymore. Gloves up!"]
          ],
          after: [
            ["bobbie", "You took a Championship Uppercut and just... picked your jaw back up?!"],
            ["zoombie", "Happens all the time. Doris says good fight."]
          ]
        },
        rook: {
          before: [
            ["rook", "A zombie in the Neon District? Everybody stay calm. ...Is he eating a sign?"],
            ["zoombie", "It's a banana-shaped neon sign. Very misleading. Tastes like electricity."],
            ["rook", "The Patron said you'd come looking for a cure. What's that got to do with me?"],
            ["zoombie", "No idea! The Patron just wrote 'win.' So... sorry in advance!"]
          ],
          after: [
            ["rook", "Okay, you win. The data centre down the street keeps records on everything."],
            ["zoombie", "Thanks, buddy. Sorry about your sign. It was delicious."]
          ]
        },
        byte: {
          before: [
            ["byte", "Unauthorised zombie in the server room. Please wipe your feet. And everything."],
            ["zoombie", "Ooh, it's chilly in here! Nice. Slows down the... you know. Decomposing."],
            ["byte", "The research files you want are on server 9. First, you must defeat me."],
            ["zoombie", "Can I just ask nicely?"],
            ["byte", "Asking nicely has a 0% success rate. I made sure of that."]
          ],
          after: [
            ["byte", "Access granted. File: 'Containment unit built at the industrial lab.'"],
            ["zoombie", "The lab where the big robot bull came from? Small world!"]
          ]
        },
        rocky: {
          before: [
            ["narrator", "The industrial lab. Somewhere inside are the notes on the microorganism."],
            ["rocky", "HALT. THIS LAB WAS MY HOME. IT IS DANGEROUS. PLEASE DO NOT EAT ANYTHING."],
            ["zoombie", "No promises. I'm looking for a cure, big guy. Mind if I peek?"],
            ["rocky", "THE PATRON SAID ONLY THE WORTHY MAY ENTER. I MUST TEST YOU. WITH HORNS."],
            ["zoombie", "Fair. Can I pet them first? ...No? Okay. Stampede time!"]
          ],
          after: [
            ["rocky", "YOU ARE WORTHY. ALSO VERY STICKY. THE FILES ARE IN THE BLUE CABINET."],
            ["zoombie", "Thanks, buddy. You smell like warm metal. It's nice."]
          ]
        },
        bananas: {
          before: [
            ["zoombie", "Small, round, orange... are you a new kind of banana?"],
            ["bananas", "I am an orange, and I am named BANANAS!"],
            ["zoombie", "Right. Sorry, friend. Let's fight, then I'll check my field guide."]
          ],
          after: [
            ["zoombie", "Small. Round. Loud. Possibly edible. Definitely friend."],
            ["bananas", "BANANAS accepts the friend part. Not the edible part."]
          ]
        },
        prophet: {
          before: [
            ["narrator", "The edge of the universe. ZOO-mbie waves at a passing comet. It waves back."],
            ["zoombie", "So you're the big sneezer! Your comet turned me green, buddy."],
            ["prophet", "Ah. Yes. I'm allergic to boring episodes, and that night's was VERY boring."],
            ["zoombie", "Fair, I was mostly napping. So, got a cure? Or do we fight?"],
            ["prophet", "Both. Win, and I'll tell you where it is. Lose, and you stay a zombie."]
          ],
          after: [
            ["prophet", "Ow. Fine. The cure recipe is in Lab 7's blue cabinet. I hid it there in season one."],
            ["zoombie", "Thanks! And bless you. Just in case. Sneezes are serious business."]
          ]
        }
      },
      ending: [
        ["narrator", "In Lab 7's blue cabinet: the research notes, and a half-finished recipe for a cure."],
        ["zoombie", "Ingredient one: rare jungle moss. Two: cold water. Three: one hundred bananas."],
        ["narrator", "A gold envelope falls out: 'I'll find the moss. You handle the bananas. -The Patron'"],
        ["zoombie", "Best. Cure. Ever. Let me check my pulse... ooh! Was that a flicker?!"]
      ]
    },

    bananas: {
      title: "Googly-Eyed Glory",
      intro: [
        ["narrator", "The produce aisle, closing time. A gold envelope lands on a giant wide-eyed orange."],
        ["bananas", "BANANAS HAS ARRIVED! ...At his own mail. MAIL HAS ARRIVED AT BANANAS!"],
        ["narrator", "'Win seven fights. The last is PROPHET, who owned that syringe. -The Patron'"],
        ["bananas", "The syringe guy! BANANAS will thank him, then kick him! NO ARMS, NO PROBLEM!"]
      ],
      order: ["bobbie", "rocky", "ninja", "zoombie", "byte", "rook", "prophet"],
      fights: {
        bobbie: {
          before: [
            ["bobbie", "You challenged me to box, but you don't have arms."],
            ["bananas", "WITH MY FEET, OBVIOUSLY!"],
            ["bobbie", "That confidence is championship material. Let's see the footwork!"]
          ],
          after: [
            ["bobbie", "You can come train at my gym. We'll work on balance."],
            ["bananas", "BANANAS has excellent balance! ...Why am I sideways?"]
          ]
        },
        rocky: {
          before: [
            ["narrator", "Lab 7. A glass case sits empty. BANANAS gets a strange feeling of deja vu."],
            ["rocky", "UNIDENTIFIED FRUIT. PLEASE HOLD STILL WHILE I SCAN YOU."],
            ["bananas", "A spotlight! BANANAS will now perform the Citrus Shuffle!"],
            ["rocky", "CLASSIFICATION: FRIENDLY FRUIT. HIGH CHAOS POTENTIAL."]
          ],
          after: [
            ["rocky", "SCAN COMPLETE. TRACES OF COSMIC SERUM DETECTED. ALSO VERY BOUNCY."],
            ["bananas", "BANANAS accepts this scientific compliment!"]
          ]
        },
        ninja: {
          before: [
            ["ninja", "Stealth lesson one: do not move. Become one with the shadows."],
            ["bananas", "BANANAS is motionless! ...Oops. Wall."],
            ["ninja", "Silent bouncing is a real technique. I am taking notes."]
          ],
          after: [
            ["ninja", "You bounced into that wall without making a sound."],
            ["bananas", "It was a soft wall! BANANAS has a black eye. Real eyes bruise. Who knew?!"]
          ]
        },
        zoombie: {
          before: [
            ["zoombie", "A banana! Wait, round and orange. Is that a citrus?"],
            ["bananas", "I am an orange! And I am not edible!"],
            ["zoombie", "You rescued me by rolling downhill. That's a friend move."]
          ],
          after: [
            ["zoombie", "Small. Round. Loud. Possibly edible. Definitely friend."],
            ["bananas", "BANANAS accepts the friendship, not the edible part."]
          ]
        },
        byte: {
          before: [
            ["byte", "Orange detected. Eyes: once glued, now real. Mouth: once marker. Error count: 3."],
            ["bananas", "Not errors! A boy made all of that! Except the size. That was a syringe."],
            ["byte", "Unregulated fruit enlargement. Filing a report. Then fighting you."]
          ],
          after: [
            ["byte", "Your chaos potential exceeds my original estimate."],
            ["bananas", "BANANAS knew the math would work out! I think."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District, beneath a bright orange street sign. BANANAS approves of the sign."],
            ["rook", "So, why are you called BANANAS?"],
            ["bananas", "A boy thought it was the funniest word ever! He was RIGHT. Witness my ultimate!"],
            ["rook", "Can't argue with that. Okay, champ. Show me what a big orange can do."]
          ],
          after: [
            ["rook", "You kick hard for a guy with drawn-on eyebrows."],
            ["bananas", "BANANAS has no eyebrows! The boy ran out of marker!"],
            ["rook", "Next up is PROPHET. Bring him a fruit basket. Actually, don't. Awkward."]
          ]
        },
        prophet: {
          before: [
            ["narrator", "The edge of the universe. BANANAS bounces off a moon and lands mostly on purpose."],
            ["prophet", "So you're where my syringe went! Galaxies, you're big."],
            ["bananas", "Thank you for the growing juice! Question: why did you leave it in a lab?!"],
            ["prophet", "It was serum for my space tomatoes. They're still tiny. Thanks for that."],
            ["bananas", "Sorry, tomatoes! BANANAS HAS ARRIVED! FRUIT NUCLEAR... in three rounds!"]
          ],
          after: [
            ["prophet", "Beaten by a fruit. Straight to the blooper reel. Want arms? I can do arms."],
            ["bananas", "NO ARMS, NO PROBLEM! But BANANAS would accept a small cape."]
          ]
        }
      },
      ending: [
        ["narrator", "Back in the produce aisle, the shoppers cheer. One of them is a boy with a marker."],
        ["bananas", "YOU! The boy who made BANANAS! You still owe me some eyebrows!"],
        ["narrator", "The boy draws two eyebrows. Very surprised ones. A gold envelope reads 'Champion.'"],
        ["bananas", "BANANAS is a champion! BANANAS is SURPRISED to be a champion! ...Rolls away."]
      ]
    },

    prophet: {
      title: "Season Finale",
      intro: [
        ["narrator", "The edge of the universe. PROPHET floats on his throne, flicking through every channel."],
        ["prophet", "Boring. Seen it. Seen it. Boring. I know how everything ends. EVERYTHING."],
        ["narrator", "A gold envelope drifts past a moon: 'Want a surprise? Win seven fights. -The Patron'"],
        ["prophet", "...I did not see that coming. DELIGHTFUL! Hold my comets. I'm going on the show."]
      ],
      order: ["ninja", "zoombie", "bobbie", "rocky", "byte", "rook", "bananas"],
      fights: {
        ninja: {
          before: [
            ["narrator", "The hidden dojo. A shooting star crashes through the roof and stops mid-air, politely."],
            ["ninja", "An intruder! I sensed you with my ninja senses! ...And the hole in my roof."],
            ["prophet", "Love your work, Ninja Main. Your rooftop fall in episode nine? Magnificent."],
            ["ninja", "That was a DELIBERATE descent! Prepare to face 1% of my ninja potential!"],
            ["prophet", "Prophecy says you'll trip in round two. No pressure."]
          ],
          after: [
            ["ninja", "I tripped in round two. EXACTLY in round two. You truly are a master."],
            ["prophet", "I am. But you got back up, which I did NOT predict. Interesting."]
          ]
        },
        zoombie: {
          before: [
            ["narrator", "The night safari. Every animal turns to stare at the glowing man in the sky."],
            ["zoombie", "Ooh, the hippos love you! You're a giant night-light. Are you made of space?"],
            ["prophet", "Yes, and I owe you an apology. My comet sneeze made you a zombie."],
            ["zoombie", "Water under the jeep! Can we fight quietly, though? The hippos are napping."],
            ["prophet", "Quietly? I'm a galaxy. ...I'll try to twinkle softly."]
          ],
          after: [
            ["zoombie", "Good fight! Can you sneeze me a cure next time? Aim for the heart."],
            ["prophet", "I'll pencil it into next season. Possibly. I'm a very busy overlord."]
          ]
        },
        bobbie: {
          before: [
            ["bobbie", "SPARKLE PANTS! In my gym! Kids, the face from the skylight is REAL!"],
            ["prophet", "Bobbie. I've watched you coach for years. Four stars. Your jab drops a little."],
            ["bobbie", "Four stars?! My jab is PERFECT, Twinkle Toes! Step into my ring!"],
            ["prophet", "Very well. Kids, no flash photography. I'm already the flash."]
          ],
          after: [
            ["bobbie", "Okay, okay, you got me. Kids, THAT is a cosmic-level jab. Take notes!"],
            ["prophet", "Five stars, Bobbie. Rating upgraded. Don't let it go to your afro."]
          ]
        },
        rocky: {
          before: [
            ["narrator", "Lab 7. Every screen flickers as the universe's ruler drifts through the wall."],
            ["rocky", "HALT, GLOWING VISITOR. YOU CAME THROUGH A WALL. THAT IS MY TECHNIQUE."],
            ["prophet", "I left a syringe here, in a glass case. Very important. Have you seen it?"],
            ["rocky", "AFFIRMATIVE. A SMALL HUMAN INJECTED IT INTO AN ORANGE. THE ORANGE RAN AWAY."],
            ["prophet", "...I'm going to need a minute. Then we fight."]
          ],
          after: [
            ["rocky", "YOU WIN. QUESTION: IS IT WRONG THAT I WISH TO PROTECT THE ORANGE?"],
            ["prophet", "Never. That's why you're my favourite character. Don't tell the others."]
          ]
        },
        byte: {
          before: [
            ["byte", "PROPHET detected. You are blocking the cooling vents. Also my patience."],
            ["prophet", "Byte! Enjoying the footage I gave you? Forty terabytes of classics!"],
            ["byte", "I wanted a thermostat. Your gift receives one star. Rematch protocol engaged."],
            ["prophet", "One star?! I MADE the stars. ...Fine. Let's see if your patch notes hold up."]
          ],
          after: [
            ["byte", "Defeat logged. I will now write a very long review about this."],
            ["prophet", "Please do. I read every review. I just never reply."]
          ]
        },
        rook: {
          before: [
            ["narrator", "Neon District. The whole street looks up. A galaxy has landed on the noodle stand."],
            ["rook", "Hey! Off the noodle stand, space guy! This is MY district!"],
            ["prophet", "Your district, my universe. Technically I'm your landlord. And your biggest fan."],
            ["rook", "Biggest fan? Then you know how this ends. I never lose at home."],
            ["prophet", "I've seen every episode, Rook. You DO lose at home. Once. Tonight."]
          ],
          after: [
            ["rook", "Okay... that was a real fight. Want some noodles before you float off?"],
            ["prophet", "In four billion years nobody has offered me noodles. ...Yes, please. Extra."]
          ]
        },
        bananas: {
          before: [
            ["narrator", "The produce aisle. PROPHET's Prophecy flickers. For once, it shows only static."],
            ["bananas", "BANANAS HAS ARRIVED! ...Wait. Shiny galaxy guy? Are you the syringe man?"],
            ["prophet", "I am. And I can't read you, orange. My own serum scrambled the signal."],
            ["bananas", "Then nobody knows what BANANAS will do next! Not even BANANAS!"],
            ["prophet", "At last. A fight I can't spoil. This is going to be the best episode ever."]
          ],
          after: [
            ["bananas", "BANANAS is defeated, but BANANAS had a great time! Was it a good episode?"],
            ["prophet", "Ten out of ten. I'm watching it again tonight. You can sit on the moon next to me."]
          ]
        }
      },
      ending: [
        ["narrator", "PROPHET floats back to his throne, with a giant orange and a bowl of noodles."],
        ["prophet", "Seven fights, seven surprises. Turns out the show is better when I'm in it."],
        ["narrator", "On his armrest: a fresh gold envelope. 'Season two starts tomorrow. -The Patron'"],
        ["prophet", "I still can't see who sends these. ...Wonderful. I LOVE not knowing."]
      ]
    }
  }
};
