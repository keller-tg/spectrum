import type { QuestionText } from "@/lib/schema/questions";

/**
 * English wording for every question. Rules (validated): one idea per item,
 * ≤ 25 words, no absolutes, no loaded terms, no US-specific framing, culturally
 * portable, and no wording that assumes the respondent's country's current policy
 * ("kept low", "stay out"), so scores compare across countries.
 * Explainers define terms; they never hint at which answer "fits".
 * Grouped by axis here for review; the order shown to users is in bank.ts.
 */
export const QUESTION_TEXT_EN: Record<string, QuestionText> = {
  // 1 · Distribution (Equality ↔ Markets)
  "q-dist-01": {
    text: "Governments should actively reduce the gap between high and low incomes.",
    explainer: "“Actively” means through deliberate policy, such as taxes, benefits or wage rules.",
  },
  "q-dist-02": {
    text: "Incomes should be left to the market, even if some people end up far richer than others.",
    explainer:
      "“The market” means wages and profits set by buying and selling, rather than by the state.",
  },
  "q-dist-03": {
    text: "People with high incomes should pay a much higher tax rate than people on average incomes.",
    explainer: "The tax rate is the share of income that is paid in tax.",
  },
  "q-dist-04": {
    text: "Prices such as rents should be set by the market, even when they rise sharply.",
    explainer: "The alternative to market prices is a legal limit, such as rent control.",
  },
  "q-dist-05": {
    text: "Pay should be agreed between each employer and worker, without minimum levels set by law or by unions.",
    explainer:
      "Minimum pay can be set by law (a minimum wage) or by agreements between unions and employers for a whole sector.",
  },
  "q-dist-06": {
    text: "Large inheritances should be heavily taxed to reduce differences in wealth.",
    explainer: "An inheritance is money or property passed on when someone dies.",
  },

  // 2 · Ownership (Collective ↔ Private)
  "q-own-01": {
    text: "Services such as water and electricity are best provided by private companies.",
    explainer:
      "“Provided” means the companies own and run the service; the state may still set rules for it.",
  },
  "q-own-02": {
    text: "Companies that supply water and power should be owned by the public.",
    explainer:
      "“Owned by the public” can mean the state, a municipality or another public body acting for citizens.",
  },
  "q-own-03": {
    text: "Private companies generally run businesses more efficiently than the state does.",
    explainer: "Efficiency means delivering goods or services at lower cost or higher quality.",
  },
  "q-own-04": {
    text: "More companies should be owned by the people who work in them.",
    explainer:
      "Worker ownership is often organised as a cooperative, in which each member has a vote.",
  },
  "q-own-05": {
    text: "Land is best owned by private individuals and companies.",
    explainer:
      "This concerns land itself, such as farmland, building plots and forests, rather than the buildings on it.",
  },
  "q-own-06": {
    text: "Companies that extract oil, gas and minerals should be owned by the state.",
    explainer: "Extraction means mining or drilling natural resources out of the ground.",
  },

  // 3 · Trade (Protectionism ↔ Free trade)
  "q-trade-01": {
    text: "My country should protect its own industries from foreign competition.",
    explainer:
      "Protection usually means tariffs (taxes on imports), limits on imports or subsidies for domestic producers.",
  },
  "q-trade-02": {
    text: "Trade between countries should face few tariffs or other barriers.",
    explainer:
      "Tariffs are taxes on imported goods. Other barriers include import quotas and rules that favour domestic products.",
  },
  "q-trade-03": {
    text: "Foreign investors should face limits on buying companies in my country.",
    explainer: "This is about foreign ownership of domestic businesses, not about trade in goods.",
  },
  "q-trade-04": {
    text: "Countries are better off specialising in what they produce best and trading for the rest.",
    explainer:
      "Specialising means focusing on some industries and importing goods that other countries make more cheaply.",
  },
  "q-trade-05": {
    text: "Companies should be free to move production to wherever costs are lowest.",
    explainer: "Moving production to another country is often called offshoring.",
  },
  "q-trade-06": {
    text: "My country should grow most of its own food, even if imports would be cheaper.",
    explainer: "This is about self-sufficiency in food.",
  },

  // 4 · State power (Liberty ↔ Authority)
  "q-lib-01": {
    text: "Adults should be allowed to make risky choices that harm only themselves.",
    explainer: "For example dangerous sports, smoking or heavy drinking.",
  },
  "q-lib-02": {
    text: "The law should protect people from their own harmful choices.",
    explainer:
      "For example through bans, compulsory safety rules or penalties for risky personal behaviour.",
  },
  "q-lib-03": {
    text: "Police should have broad powers to stop and search people in order to prevent crime.",
    explainer:
      "“Stop and search” means checking a person or their belongings without arresting them.",
  },
  "q-lib-04": {
    text: "People should be free to express views that most others find offensive.",
    explainer:
      "This concerns what the law permits, not whether such views deserve agreement or respect.",
  },
  "q-lib-05": {
    text: "Authorities should be able to monitor online communication to prevent serious crime.",
    explainer:
      "Monitoring can include reading messages, tracking contacts or collecting browsing data.",
  },
  "q-lib-06": {
    text: "Peaceful protests should be allowed even when they disrupt daily life.",
    explainer:
      "Disruption means things like blocked roads or delayed public transport, without violence.",
  },

  // 5 · Centralization (Centralized ↔ Decentralized)
  "q-cent-01": {
    text: "Decisions should be made at the most local level possible.",
    explainer:
      "Local levels are municipalities, districts or regions, as opposed to the national government.",
  },
  "q-cent-02": {
    text: "Most rules, such as what schools teach, should be set nationally rather than by regions.",
    explainer: "Regions are units below the national level, such as states, provinces or cantons.",
  },
  "q-cent-03": {
    text: "The national government usually solves problems better than regional or local governments.",
    explainer: "The national government is the central government of the whole country.",
  },
  "q-cent-04": {
    text: "Regions should be able to set their own tax rates.",
    explainer: "Regions are units below the national level, such as states, provinces or cantons.",
  },
  "q-cent-05": {
    text: "Regions should be able to pass their own laws on matters such as policing, health and schools.",
    explainer: "Regions are units below the national level, such as states, provinces or cantons.",
  },
  "q-cent-06": {
    text: "Small municipalities should be merged into larger ones.",
    explainer:
      "A municipality is the smallest unit of local government, such as a town or village council.",
  },

  // 6 · Participation (Rule by the many ↔ Rule by the few)
  "q-part-01": {
    text: "Citizens should be able to vote directly on important laws.",
    explainer: "A direct vote on a law is often called a referendum or popular vote.",
  },
  "q-part-02": {
    text: "Elected representatives, not a popular vote, should have the final say on important laws.",
    explainer: "Elected representatives are members of a parliament or council chosen by voters.",
  },
  "q-part-03": {
    text: "Decisions such as setting interest rates should be left to independent experts.",
    explainer: "Interest rates decide how expensive it is to borrow money.",
  },
  "q-part-04": {
    text: "Leaders who do not have to win elections often make better long-term decisions.",
    explainer:
      "Such leaders could include monarchs, appointed officials or members of a governing party.",
  },
  "q-part-05": {
    text: "Assemblies of randomly selected citizens should help decide important issues.",
    explainer:
      "Choosing citizens by lot, as for a jury, is sometimes called sortition or a citizens’ assembly.",
  },
  "q-part-06": {
    text: "Elected officials should follow the wishes of their voters, even when they personally disagree.",
    explainer:
      "This is about whether representatives act on their voters’ instructions or on their own judgement.",
  },

  // 7 · Social change (Progressive ↔ Traditional)
  "q-trad-01": {
    text: "Children are best raised by a married mother and father.",
    explainer:
      "This is about which family form is best for children, not about what the law should allow.",
  },
  "q-trad-02": {
    text: "Many different kinds of families can raise children equally well.",
    explainer:
      "Kinds of families include single parents, same-sex couples, unmarried couples and extended families.",
  },
  "q-trad-03": {
    text: "Traditions should be adapted to modern values rather than kept as they are.",
    explainer: "Traditions are customs, rituals and norms handed down over generations.",
  },
  "q-trad-04": {
    text: "When in doubt, it is better to keep an old custom than to change it.",
    explainer: "Customs are the habits, rituals and norms a society has kept over generations.",
  },
  "q-trad-05": {
    text: "Mothers rather than fathers should be the main carers of young children.",
    explainer: "The main carer is the parent who spends most time looking after the children.",
  },
  "q-trad-06": {
    text: "Same-sex couples should have the same right to marry as other couples.",
    explainer: "This is about civil marriage under the law, not religious ceremonies.",
  },

  // 8 · Religion and state (Secular ↔ Religious)
  "q-rel-01": {
    text: "Religious beliefs should be kept out of law-making.",
    explainer:
      "This concerns how laws are justified and written, not whether lawmakers may be religious.",
  },
  "q-rel-02": {
    text: "Laws should be based on religious teachings about right and wrong.",
    explainer:
      "Religious teachings are the guidance a faith gives on how to live, for example on family life or charity.",
  },
  "q-rel-03": {
    text: "State-run schools should include lessons that teach a religious faith.",
    explainer:
      "Teaching a faith means teaching its beliefs and practices as true, as opposed to neutral teaching about religions.",
  },
  "q-rel-04": {
    text: "Religious organisations should fund themselves, without money from the state.",
    explainer: "State money includes direct payments and church taxes collected by the state.",
  },
  "q-rel-05": {
    text: "Religious leaders should have a say in national political decisions.",
    explainer:
      "Having a say could mean formal seats in institutions or regular consultation by the government.",
  },
  "q-rel-06": {
    text: "Courts and state schools should keep their walls free of religious symbols, such as crosses.",
    explainer: "This is about symbols the institution puts up, not about what individuals wear.",
  },

  // 9 · Ecology (Growth ↔ Ecological sustainability)
  "q-eco-01": {
    text: "When economic growth and environmental protection conflict, growth should come first.",
    explainer:
      "Economic growth is an increase in the total goods and services an economy produces.",
  },
  "q-eco-02": {
    text: "Slower economic growth is a price worth paying to protect the environment.",
    explainer:
      "Protecting the environment includes preserving habitats, species, clean air and a stable climate.",
  },
  "q-eco-03": {
    text: "Technological progress, rather than consuming less, is the best answer to environmental problems.",
    explainer:
      "Examples of such technology include cleaner energy, carbon capture and more efficient machines.",
  },
  "q-eco-04": {
    text: "Rich countries should aim to consume less, even if their economies stop growing.",
    explainer:
      "Consuming less means buying fewer goods and using less energy and transport overall.",
  },
  "q-eco-05": {
    text: "Large areas of land and sea should be closed to farming, mining and building.",
    explainer: "Such areas are usually called protected areas or nature reserves.",
  },
  "q-eco-06": {
    text: "Projects that create jobs should go ahead even if they harm local nature.",
    explainer: "Local nature means the plants, animals and landscapes in the area of the project.",
  },

  // 10 · Nation and world (Nationalism ↔ Internationalism)
  "q-nat-01": {
    text: "My country should make its own laws rather than share that power with international bodies.",
    explainer:
      "International bodies include the United Nations, regional unions and international courts.",
  },
  "q-nat-02": {
    text: "International bodies should be able to make some rules that my country must follow.",
    explainer:
      "Examples include trade rules, human-rights courts and agreements on climate or fishing.",
  },
  "q-nat-03": {
    text: "I feel as much a citizen of the world as of my own country.",
    explainer: "This is about where your sense of belonging and loyalty lies.",
  },
  "q-nat-04": {
    text: "A shared national identity is important for holding a society together.",
    explainer:
      "National identity is a common sense of history, culture and belonging to the nation.",
  },
  "q-nat-05": {
    text: "My country should put its own interests first, even at a cost to people in other countries.",
    explainer: "Interests include the economy, security and the well-being of its citizens.",
  },
  "q-nat-06": {
    text: "My government should care as much about people in other countries as about its own citizens.",
    explainer: "This is about whose well-being a government should weigh when it makes decisions.",
  },

  // 11 · Foreign intervention (Interventionist ↔ Restraint)
  "q-int-01": {
    text: "My country should be willing to join military action to stop mass atrocities in another country.",
    explainer:
      "Mass atrocities include genocide, ethnic cleansing and the large-scale killing of civilians.",
  },
  "q-int-02": {
    text: "My country should use military force abroad only if it is attacked first.",
    explainer: "Being attacked means a direct armed attack on your country’s territory or forces.",
  },
  "q-int-03": {
    text: "My country should put strong pressure on foreign governments that abuse human rights.",
    explainer: "Pressure can mean sanctions, cutting aid or breaking off diplomatic ties.",
  },
  "q-int-04": {
    text: "Economic sanctions against other countries usually do more harm than good.",
    explainer:
      "Sanctions are restrictions on trade, finance or travel imposed to pressure a government.",
  },
  "q-int-05": {
    text: "My country should be neutral rather than belong to a military alliance.",
    explainer: "A military alliance is a treaty in which countries promise to defend each other.",
  },
  "q-int-06": {
    text: "My country should be ready to send troops to help defend partner countries if they are attacked.",
    explainer: "Partner countries are countries your country cooperates with closely.",
  },

  // 12 · Migration (Open ↔ Closed)
  "q-bord-01": {
    text: "My country should accept only a small number of immigrants each year.",
    explainer: "Immigrants are people who move to your country to live there long-term.",
  },
  "q-bord-02": {
    text: "My country should let in most people who want to live and work here.",
    explainer: "Living and working here means settling long-term, not just visiting.",
  },
  "q-bord-03": {
    text: "People who enter the country without permission should be sent back quickly.",
    explainer: "Sending people back is also called deportation or removal.",
  },
  "q-bord-04": {
    text: "Immigration is generally good for the economy of the receiving country.",
    explainer:
      "Economic effects include the work immigrants do, the taxes they pay and the public services they use.",
  },
  "q-bord-05": {
    text: "My country should take in refugees fleeing war, even when many arrive at once.",
    explainer: "A refugee is someone who has fled their country because of war or persecution.",
  },
  "q-bord-06": {
    text: "Immigrants should have to live in the country for many years before they can become citizens.",
    explainer: "Citizenship gives full rights, such as voting and a passport.",
  },
};
