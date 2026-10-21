import type { QuestionText } from "@/lib/schema/questions";

/**
 * English wording for every question. Rules (validated): one idea per item,
 * ≤ 25 words, no absolutes, no loaded terms, no US-specific framing, culturally
 * portable. Explainers define terms; they never hint at which answer "fits".
 * Grouped by axis here for review; the order shown to users is in bank.ts.
 */
export const QUESTION_TEXT_EN: Record<string, QuestionText> = {
  // 1 · Distribution (Equality ↔ Markets)
  "q-dist-01": {
    text: "Governments should actively reduce the gap between high and low incomes.",
    explainer: "“Actively” means through deliberate policy, such as taxes, benefits or wage rules, rather than leaving incomes to the market.",
  },
  "q-dist-02": {
    text: "Large differences in income are an acceptable result of a market economy.",
    explainer: "A market economy is one where most prices and wages are set by buying and selling rather than by the state.",
  },
  "q-dist-03": {
    text: "People with high incomes should pay a larger share of their income in tax than others.",
    explainer: "This describes progressive taxation: the tax rate rises as income rises.",
  },
  "q-dist-04": {
    text: "Most industries would work better with less government regulation.",
    explainer: "Regulation means rules on how businesses operate, such as licensing, prices, working conditions and product standards.",
  },
  "q-dist-05": {
    text: "Wages should be agreed between employers and workers without a legal minimum wage.",
    explainer: "A legal minimum wage is the lowest hourly or monthly pay an employer is allowed to offer.",
  },
  "q-dist-06": {
    text: "The state should guarantee a basic income to its residents, whether or not they work.",
    explainer: "A basic income is a regular payment from the state intended to cover essential living costs.",
  },

  // 2 · Ownership (Collective ↔ Private)
  "q-own-01": {
    text: "Services such as water and electricity are best provided by private companies.",
    explainer: "“Provided” here means owned and run, not regulated.",
  },
  "q-own-02": {
    text: "Key industries such as energy and railways should be owned by the public.",
    explainer: "“Owned by the public” can mean the state, a municipality or another public body acting for citizens.",
  },
  "q-own-03": {
    text: "Private companies generally run businesses more efficiently than the state does.",
    explainer: "Efficiency means delivering goods or services at lower cost or higher quality.",
  },
  "q-own-04": {
    text: "Workers should collectively own the companies they work for.",
    explainer: "Worker ownership is often organised as a cooperative, in which each member has a vote.",
  },
  "q-own-05": {
    text: "Land is best owned by private individuals and companies.",
    explainer: "This concerns land itself, such as farmland, building plots and forests, rather than the buildings on it.",
  },
  "q-own-06": {
    text: "Natural resources such as oil, gas and minerals should belong to the public.",
    explainer: "Public ownership here means the state or community owns the resources and receives the profits from them.",
  },

  // 3 · Trade (Protectionism ↔ Free trade)
  "q-trade-01": {
    text: "My country should protect its own industries from foreign competition.",
    explainer: "Protection usually means tariffs (taxes on imports), limits on imports or subsidies for domestic producers.",
  },
  "q-trade-02": {
    text: "Tariffs and other barriers to trade between countries should be reduced as far as possible.",
    explainer: "Tariffs are taxes on imported goods. Other barriers include import quotas and rules that favour domestic products.",
  },
  "q-trade-03": {
    text: "Foreign investors should face limits on buying companies in my country.",
    explainer: "This is about foreign ownership of domestic businesses, not about trade in goods.",
  },
  "q-trade-04": {
    text: "Countries are better off specialising in what they produce best and trading for the rest.",
    explainer: "Specialising means focusing on some industries and importing goods that other countries make more cheaply.",
  },
  "q-trade-05": {
    text: "Companies should be free to move production to wherever costs are lowest.",
    explainer: "Moving production to another country is often called offshoring.",
  },
  "q-trade-06": {
    text: "My country should produce its own food and essential medicines rather than rely on imports.",
    explainer: "This is about self-sufficiency in essential goods.",
  },

  // 4 · State power (Liberty ↔ Authority)
  "q-lib-01": {
    text: "Adults should be free to make choices that harm only themselves, such as using recreational drugs.",
    explainer: "Recreational drugs are substances such as cannabis that are taken for pleasure rather than for medical reasons.",
  },
  "q-lib-02": {
    text: "The law should protect people from their own harmful choices.",
    explainer: "For example through bans, compulsory safety rules or penalties for risky personal behaviour.",
  },
  "q-lib-03": {
    text: "Police should have broad powers to stop and search people in order to prevent crime.",
    explainer: "“Stop and search” means checking a person or their belongings without arresting them.",
  },
  "q-lib-04": {
    text: "People should be free to express views that most others find offensive.",
    explainer: "This concerns what the law permits, not whether such views deserve agreement or respect.",
  },
  "q-lib-05": {
    text: "Authorities should be able to monitor online communication to prevent serious crime.",
    explainer: "Monitoring can include reading messages, tracking contacts or collecting browsing data.",
  },
  "q-lib-06": {
    text: "Peaceful protests should be allowed even when they disrupt daily life.",
    explainer: "Disruption means things like blocked roads or delayed public transport, without violence.",
  },

  // 5 · Centralization (Centralized ↔ Decentralized)
  "q-cent-01": {
    text: "Decisions should be made at the most local level possible.",
    explainer: "Local levels are municipalities, districts or regions, as opposed to the national government.",
  },
  "q-cent-02": {
    text: "Important rules, such as school curricula, should be the same across the whole country.",
    explainer: "A curriculum is what pupils are taught. Some countries set it nationally, others regionally.",
  },
  "q-cent-03": {
    text: "A strong national government solves problems better than regional or local governments.",
    explainer: "The national government is the central government of the whole country.",
  },
  "q-cent-04": {
    text: "Regions should be able to set their own tax rates.",
    explainer: "Regions are units below the national level, such as states, provinces or cantons.",
  },
  "q-cent-05": {
    text: "Local communities should be able to opt out of national laws they strongly oppose.",
    explainer: "Opting out means the law would not apply within that community.",
  },
  "q-cent-06": {
    text: "Regional governments should have little power of their own.",
    explainer: "Regional governments sit between local councils and the national government, such as states, provinces or cantons.",
  },

  // 6 · Participation (Rule by the many ↔ Rule by the few)
  "q-part-01": {
    text: "Citizens should be able to vote directly on important laws.",
    explainer: "A direct vote on a law is often called a referendum or popular vote.",
  },
  "q-part-02": {
    text: "Complex laws are better decided by elected representatives than by popular vote.",
    explainer: "Elected representatives are members of a parliament or council chosen by voters.",
  },
  "q-part-03": {
    text: "Technical questions, such as setting interest rates, should be left to independent experts.",
    explainer: "Interest rates are usually set by a central bank whose experts are appointed, not elected.",
  },
  "q-part-04": {
    text: "A country can be well governed by unelected leaders.",
    explainer: "Unelected leaders could include monarchs, appointed officials or a governing party.",
  },
  "q-part-05": {
    text: "Assemblies of randomly selected citizens should help decide important issues.",
    explainer: "Choosing citizens by lot, as for a jury, is sometimes called sortition or a citizens’ assembly.",
  },
  "q-part-06": {
    text: "Elected officials should follow the wishes of their voters, even when they personally disagree.",
    explainer: "This is about whether representatives act on their voters’ instructions or on their own judgement.",
  },

  // 7 · Social change (Progressive ↔ Traditional)
  "q-trad-01": {
    text: "Society should encourage the traditional family of a married mother and father.",
    explainer: "Encouragement could mean tax benefits, public messaging or family law that favours this family form.",
  },
  "q-trad-02": {
    text: "Many different kinds of families can raise children equally well.",
    explainer: "Kinds of families include single parents, same-sex couples, unmarried couples and extended families.",
  },
  "q-trad-03": {
    text: "Same-sex couples should have the same right to marry as other couples.",
    explainer: "This is about civil marriage under the law, not religious ceremonies.",
  },
  "q-trad-04": {
    text: "Long-standing customs usually hold wisdom that should not be lightly discarded.",
    explainer: "Customs are the habits, rituals and norms a society has kept over generations.",
  },
  "q-trad-05": {
    text: "Men and women are naturally suited to different roles in society.",
    explainer: "Roles means responsibilities such as paid work, caring for children or leading a household.",
  },
  "q-trad-06": {
    text: "Schools should teach children to question the traditions they grow up with.",
    explainer: "Questioning means examining critically, which may lead to keeping or to changing a tradition.",
  },

  // 8 · Religion and state (Secular ↔ Religious)
  "q-rel-01": {
    text: "Religious beliefs should be kept out of law-making.",
    explainer: "This concerns how laws are justified and written, not whether lawmakers may be religious.",
  },
  "q-rel-02": {
    text: "Laws should reflect the moral teachings of religion.",
    explainer: "Moral teachings are a religion’s guidance on right and wrong, for example on family life or charity.",
  },
  "q-rel-03": {
    text: "Public schools should include religious instruction.",
    explainer: "Religious instruction teaches a faith’s beliefs and practices, as opposed to neutral teaching about religions.",
  },
  "q-rel-04": {
    text: "The state should not fund religious organisations.",
    explainer: "Funding includes direct payments, church taxes collected by the state and tax exemptions.",
  },
  "q-rel-05": {
    text: "Religious leaders should have a say in national political decisions.",
    explainer: "Having a say could mean formal seats in institutions or regular consultation by the government.",
  },
  "q-rel-06": {
    text: "Religious symbols should not be displayed in public buildings such as courts and schools.",
    explainer: "Religious symbols are objects or images associated with a faith, such as crosses, crescents or icons.",
  },

  // 9 · Ecology (Growth ↔ Ecological sustainability)
  "q-eco-01": {
    text: "When economic growth and environmental protection conflict, growth should come first.",
    explainer: "Economic growth is an increase in the total goods and services an economy produces.",
  },
  "q-eco-02": {
    text: "Protecting nature matters more than economic growth when the two conflict.",
    explainer: "Protecting nature includes preserving habitats, species, clean air and a stable climate.",
  },
  "q-eco-03": {
    text: "Technological progress, rather than consuming less, is the best answer to environmental problems.",
    explainer: "Examples of such technology include cleaner energy, carbon capture and more efficient machines.",
  },
  "q-eco-04": {
    text: "Rich countries should aim to consume less, even if their economies stop growing.",
    explainer: "This idea is sometimes called degrowth.",
  },
  "q-eco-05": {
    text: "Large areas of land and sea should be closed to farming, mining and building.",
    explainer: "Such areas are usually called protected areas or nature reserves.",
  },
  "q-eco-06": {
    text: "Environmental rules should not be allowed to slow down the building of homes, roads and power plants.",
    explainer: "Environmental rules include impact assessments, protections for species and limits on emissions.",
  },

  // 10 · Nation and world (Nationalism ↔ Internationalism)
  "q-nat-01": {
    text: "My country should keep full control over its own laws rather than share it with international bodies.",
    explainer: "International bodies include the United Nations, regional unions and international courts.",
  },
  "q-nat-02": {
    text: "International bodies should be able to make some rules that my country must follow.",
    explainer: "Examples include trade rules, human-rights courts and agreements on climate or fishing.",
  },
  "q-nat-03": {
    text: "I feel as much a citizen of the world as of my own country.",
    explainer: "This is about where your sense of belonging and loyalty lies.",
  },
  "q-nat-04": {
    text: "A shared national identity is important for holding a society together.",
    explainer: "National identity is a common sense of history, culture and belonging to the nation.",
  },
  "q-nat-05": {
    text: "My country’s interests should come before those of other countries.",
    explainer: "This is about how a government weighs its own citizens’ interests against those of people abroad.",
  },
  "q-nat-06": {
    text: "Rich countries should give much more aid to poorer countries.",
    explainer: "Aid includes grants, low-interest loans and support for health or education.",
  },

  // 11 · Foreign intervention (Interventionist ↔ Restraint)
  "q-int-01": {
    text: "Military force can be justified to stop mass atrocities in another country.",
    explainer: "Mass atrocities include genocide, ethnic cleansing and the large-scale killing of civilians.",
  },
  "q-int-02": {
    text: "My country should use military force abroad only if it is attacked first.",
    explainer: "Being attacked means a direct armed attack on your country’s territory or forces.",
  },
  "q-int-03": {
    text: "Powerful countries have a responsibility to promote democracy around the world.",
    explainer: "Promotion can range from diplomatic pressure and funding to sanctions or force.",
  },
  "q-int-04": {
    text: "Economic sanctions against other countries usually do more harm than good.",
    explainer: "Sanctions are restrictions on trade, finance or travel imposed to pressure a government.",
  },
  "q-int-05": {
    text: "My country should stay out of military alliances.",
    explainer: "A military alliance is a treaty in which countries promise to defend each other.",
  },
  "q-int-06": {
    text: "My country should be ready to send troops to defend its allies.",
    explainer: "Allies are countries your country has agreed to cooperate with on defence.",
  },

  // 12 · Migration (Open ↔ Closed)
  "q-bord-01": {
    text: "Immigration into my country should be kept low.",
    explainer: "Immigration means people moving to your country to live there long-term.",
  },
  "q-bord-02": {
    text: "People should be free to move to and settle in the country of their choice.",
    explainer: "Settling means living and working there permanently, not just visiting.",
  },
  "q-bord-03": {
    text: "People who enter the country without permission should be sent back quickly.",
    explainer: "Sending people back is also called deportation or removal.",
  },
  "q-bord-04": {
    text: "Immigration is generally good for the economy of the receiving country.",
    explainer: "Economic effects include the work immigrants do, the taxes they pay and the public services they use.",
  },
  "q-bord-05": {
    text: "My country should take in refugees fleeing war, even when many arrive at once.",
    explainer: "A refugee is someone who has fled their country because of war or persecution.",
  },
  "q-bord-06": {
    text: "Citizenship should be hard to obtain.",
    explainer: "Citizenship gives full rights, such as voting and a passport, usually after years of residence.",
  },
};
