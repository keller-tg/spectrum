import type { AxisId } from "./axes";

/**
 * Coordinate rubric (PLAN §5.4). Every content batch places entries relative to
 * these anchors so 600+ entries written at different times stay consistent.
 * Reference ids are ideologies in /data/ideologies; the validator warns if missing.
 */
export interface RubricAnchor {
  value: -100 | -50 | 0 | 50 | 100;
  description: string;
  references: string[];
}

export const RUBRIC: Record<AxisId, RubricAnchor[]> = {
  distribution: [
    {
      value: -100,
      description: "Market distribution abolished; goods distributed by need or by plan.",
      references: ["anarcho-communism", "marxism-leninism"],
    },
    {
      value: -50,
      description:
        "Extensive redistribution: high progressive taxes, universal welfare state, strong labour protection.",
      references: ["democratic-socialism", "social-democracy"],
    },
    {
      value: 0,
      description: "Mixed economy: moderate taxes and welfare; markets set most prices and wages.",
      references: ["christian-democracy", "social-liberalism"],
    },
    {
      value: 50,
      description: "Low taxes, limited welfare, light regulation of business.",
      references: ["classical-liberalism", "liberal-conservatism"],
    },
    {
      value: 100,
      description: "No redistribution or economic regulation by any authority.",
      references: ["anarcho-capitalism"],
    },
  ],
  ownership: [
    {
      value: -100,
      description: "All productive property held collectively (by the state, communes or workers).",
      references: ["marxism-leninism", "anarcho-communism"],
    },
    {
      value: -50,
      description: "Major industries public or cooperative; small private business allowed.",
      references: ["democratic-socialism", "mutualism"],
    },
    {
      value: 0,
      description: "Mixed ownership: public utilities alongside a large private sector.",
      references: ["social-democracy", "christian-democracy"],
    },
    {
      value: 50,
      description: "Private ownership dominant; few public enterprises.",
      references: ["classical-liberalism", "ordoliberalism"],
    },
    {
      value: 100,
      description: "Everything private, including roads, courts and security.",
      references: ["anarcho-capitalism"],
    },
  ],
  trade: [
    {
      value: -100,
      description: "Autarky: economic self-sufficiency, minimal foreign trade.",
      references: ["juche", "anarcho-primitivism"],
    },
    {
      value: -50,
      description: "Tariffs, import substitution and protected national industries.",
      references: ["peronism", "national-conservatism"],
    },
    {
      value: 0,
      description: "Managed trade with selective protection.",
      references: ["social-democracy"],
    },
    {
      value: 50,
      description: "Broad free-trade agreements and low tariffs.",
      references: ["ordoliberalism", "liberal-conservatism"],
    },
    {
      value: 100,
      description: "Unilateral free trade; no tariffs or capital controls.",
      references: ["libertarianism", "anarcho-capitalism"],
    },
  ],
  liberty: [
    {
      value: -100,
      description: "No coercive authority over individuals.",
      references: ["anarcho-communism", "mutualism"],
    },
    {
      value: -50,
      description: "Strong civil liberties, drug liberalisation, minimal policing of private life.",
      references: ["libertarianism", "social-liberalism"],
    },
    {
      value: 0,
      description: "Liberal democracy with ordinary security powers.",
      references: ["christian-democracy"],
    },
    {
      value: 50,
      description: "Strong policing, broad surveillance, limits on dissent.",
      references: ["national-conservatism", "khomeinism"],
    },
    {
      value: 100,
      description: "Total control of public and private life.",
      references: ["national-socialism", "juche"],
    },
  ],
  centralization: [
    {
      value: -100,
      description: "Fully unitary state; all significant decisions made centrally.",
      references: ["marxism-leninism", "juche"],
    },
    {
      value: -50,
      description: "Unitary state with weak local government.",
      references: ["gaullism", "kemalism"],
    },
    { value: 0, description: "Moderate devolution to regions.", references: ["social-democracy"] },
    {
      value: 50,
      description: "Strong federalism and subsidiarity.",
      references: ["semi-direct-federal-democracy", "christian-democracy"],
    },
    {
      value: 100,
      description: "No central authority; self-governing communes in voluntary federation.",
      references: ["libertarian-municipalism", "anarcho-communism"],
    },
  ],
  participation: [
    {
      value: -100,
      description: "All binding decisions taken by assemblies or direct votes of all members.",
      references: ["libertarian-municipalism", "democratic-confederalism"],
    },
    {
      value: -50,
      description: "Semi-direct democracy: frequent binding referendums beside parliament.",
      references: ["semi-direct-federal-democracy"],
    },
    {
      value: 0,
      description: "Representative democracy: elected parliaments decide.",
      references: ["social-democracy", "liberal-conservatism"],
    },
    {
      value: 50,
      description: "Expert or elite-led governance with limited popular input.",
      references: ["technocracy", "ordoliberalism"],
    },
    {
      value: 100,
      description: "Rule by a single person, party, clergy or caste.",
      references: ["absolute-monarchism", "fascism"],
    },
  ],
  tradition: [
    {
      value: -100,
      description: "Radical transformation of family, gender and inherited custom.",
      references: ["left-accelerationism"],
    },
    {
      value: -50,
      description: "Progressive reform of social norms.",
      references: ["social-liberalism", "green-politics"],
    },
    {
      value: 0,
      description: "Mixed: some reforms accepted, some customs defended.",
      references: ["social-democracy"],
    },
    {
      value: 50,
      description: "Preserve the traditional family and inherited customs.",
      references: ["christian-democracy", "liberal-conservatism"],
    },
    {
      value: 100,
      description: "Restore a traditional social order in full.",
      references: ["absolute-monarchism", "christian-reconstructionism"],
    },
  ],
  religion: [
    {
      value: -100,
      description: "State atheism; religion actively suppressed.",
      references: ["marxism-leninism", "juche"],
    },
    {
      value: -50,
      description: "Strict secularism (laïcité) keeping religion out of public institutions.",
      references: ["kemalism", "social-liberalism"],
    },
    {
      value: 0,
      description: "Neutral state that accommodates religious practice.",
      references: ["classical-liberalism"],
    },
    {
      value: 50,
      description: "Religion shapes public policy and moral legislation.",
      references: ["christian-democracy", "paleoconservatism"],
    },
    {
      value: 100,
      description: "Religious law or clerical rule as the basis of the state.",
      references: ["khomeinism", "christian-reconstructionism"],
    },
  ],
  ecology: [
    {
      value: -100,
      description: "Unconstrained growth; nature treated purely as a resource.",
      references: ["effective-accelerationism"],
    },
    {
      value: -50,
      description: "Growth first, with minimal environmental rules.",
      references: ["libertarianism", "national-conservatism"],
    },
    {
      value: 0,
      description: "Balance between growth and environmental protection.",
      references: ["christian-democracy"],
    },
    {
      value: 50,
      description: "Strong environmental protection and green transition.",
      references: ["green-politics"],
    },
    {
      value: 100,
      description: "Degrowth or deindustrialisation to restore ecological balance.",
      references: ["anarcho-primitivism", "green-anarchism"],
    },
  ],
  nation: [
    {
      value: -100,
      description: "The nation above all other loyalties and laws.",
      references: ["fascism", "national-socialism"],
    },
    {
      value: -50,
      description: "National sovereignty first; wary of supranational bodies.",
      references: ["national-conservatism", "gaullism"],
    },
    {
      value: 0,
      description: "Patriotic but cooperative in international institutions.",
      references: ["liberal-conservatism"],
    },
    {
      value: 50,
      description: "Deep integration in supranational institutions.",
      references: ["social-liberalism", "christian-democracy"],
    },
    {
      value: 100,
      description: "World federation, or the abolition of nations as political units.",
      references: ["anarcho-communism", "trotskyism"],
    },
  ],
  intervention: [
    {
      value: -100,
      description: "Expansionist war and conquest.",
      references: ["fascism", "national-socialism"],
    },
    {
      value: -50,
      description: "Active military interventions and global alliance commitments.",
      references: ["liberal-conservatism"],
    },
    {
      value: 0,
      description: "Defensive alliances; interventions rare and multilateral.",
      references: ["social-democracy"],
    },
    {
      value: 50,
      description: "Non-intervention and neutrality.",
      references: ["paleoconservatism", "semi-direct-federal-democracy"],
    },
    {
      value: 100,
      description: "Pacifism or absolute non-intervention.",
      references: ["libertarianism"],
    },
  ],
  borders: [
    {
      value: -100,
      description: "No border controls; free movement for all.",
      references: ["anarcho-communism", "anarcho-capitalism"],
    },
    {
      value: -50,
      description: "Liberal immigration and easy naturalisation.",
      references: ["social-liberalism"],
    },
    {
      value: 0,
      description: "Managed migration with selective admission.",
      references: ["christian-democracy"],
    },
    {
      value: 50,
      description: "Restrictive immigration and demanding naturalisation.",
      references: ["national-conservatism"],
    },
    {
      value: 100,
      description: "Closed borders and ethnic exclusion.",
      references: ["national-socialism", "juche"],
    },
  ],
};
