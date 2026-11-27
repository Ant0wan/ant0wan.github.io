/* Common ions, molecules, acids, bases, oxides and salts, shared by the
   Chemistry background (orbitals.js) and the page of compounds (compounds.html).
   One line per species: formula | name | figure (pKa, solubility, character…) | note.
   (Minerals have their own list, minerals.js, for the Geology pages.)
   In a formula, digits after a symbol or a bracket are subscripts, ^… is the charge,
   and a hydrate is written with a middle dot (CuSO4·5H2O).
   Molar masses and compositions are computed from the formula with the atomic
   weights of elements.js. */
window.Compounds = (function () {
  var DATA = `## cation
H^+|hydrogen ion (proton)||the acid of Brønsted; in water always bound to a molecule, as H₃O⁺
H3O^+|hydronium||the proton in water: pH = −log [H₃O⁺]
NH4^+|ammonium|pKa 9.25|from ammonia and an acid; in fertilisers and smelling salts
Li^+|lithium ion||carries the charge in lithium-ion batteries; a mood stabiliser
Na^+|sodium ion||the main cation outside living cells; yellow flame
K^+|potassium ion||the main cation inside living cells; lilac flame
Ag^+|silver ion||precipitates the halides; antibacterial
Cu^+|copper(I) ion||cuprous; unstable in water, it disproportionates
Mg^2+|magnesium ion||at the centre of chlorophyll; makes water hard
Ca^2+|calcium ion||bones, shells, hard water; brick-red flame
Sr^2+|strontium ion||crimson flame of red fireworks
Ba^2+|barium ion||apple-green flame; toxic when soluble
Zn^2+|zinc ion||in hundreds of enzymes; colourless
Cu^2+|copper(II) ion||blue in water, blue-green flame
Fe^2+|iron(II) ion||ferrous; pale green in water; the iron of haemoglobin
Fe^3+|iron(III) ion||ferric; yellow-brown in water; rust
Al^3+|aluminium ion||small and highly charged; alum, water treatment
Pb^2+|lead(II) ion||a toxic heavy metal
Mn^2+|manganese(II) ion||very pale pink in water
Co^2+|cobalt(II) ion||pink in water, blue when dry
Ni^2+|nickel(II) ion||green in water
Cr^3+|chromium(III) ion||green-violet; the red of ruby and the green of emerald
Hg^2+|mercury(II) ion||mercuric; toxic
Hg2^2+|mercury(I) ion||two mercury atoms bonded to each other
Sn^2+|tin(II) ion||stannous; a reducing agent
[Cu(NH3)4]^2+|tetraamminecopper(II)||the deep blue of copper salts in ammonia
[Ag(NH3)2]^+|diamminesilver(I)||Tollens’ reagent: a silver mirror with aldehydes
## anion
H^-|hydride||in NaH and LiAlH₄; reacts with water to give H₂
F^-|fluoride||strengthens tooth enamel; in toothpaste
Cl^-|chloride||seawater, stomach acid, table salt
Br^-|bromide||once a sedative; in seawater
I^-|iodide||needed by the thyroid; iodised salt
O^2-|oxide||in metal oxides; a very strong base in water
S^2-|sulfide||ores of metals; with acid, the rotten-egg smell of H₂S
N^3-|nitride||in hard ceramics such as TiN and Si₃N₄
OH^-|hydroxide||the base of water: pOH = −log [OH⁻]
O2^2-|peroxide||in H₂O₂ and Na₂O₂; an oxidant
O2^-|superoxide||in KO₂, which frees oxygen in rebreathers
CN^-|cyanide||binds iron in cytochrome oxidase: a poison; extracts gold
SCN^-|thiocyanate||blood-red with Fe³⁺: a test for iron
OCN^-|cyanate||Wöhler turned ammonium cyanate into urea (1828)
N3^-|azide||sodium azide inflates airbags
NO2^-|nitrite||cures meat; turns into nitrosamines
NO3^-|nitrate||fertilisers and explosives; all its salts are soluble
CO3^2-|carbonate||limestone, chalk, shells
HCO3^-|hydrogen carbonate (bicarbonate)||the main buffer of blood; baking soda
SO4^2-|sulfate||gypsum, Epsom salt, sulfuric acid
HSO4^-|hydrogen sulfate|pKa 1.99|the first step of sulfuric acid
SO3^2-|sulfite||preserves wine
S2O3^2-|thiosulfate||the photographer’s fixer; reduces iodine
PO4^3-|phosphate||backbone of DNA, mineral of bones, fertilisers
HPO4^2-|hydrogen phosphate||with H₂PO₄⁻, the buffer inside cells (pH ≈ 7.2)
H2PO4^-|dihydrogen phosphate|pKa 7.20|the acid half of the phosphate buffer
ClO^-|hypochlorite||bleach and disinfectant
ClO2^-|chlorite||makes chlorine dioxide for water treatment
ClO3^-|chlorate||weedkiller; oxidant in matches
ClO4^-|perchlorate||oxidant of solid rocket propellants
BrO3^-|bromate||an oxidant
IO3^-|iodate||iodises salt
MnO4^-|permanganate||deep purple; a strong oxidant
MnO4^2-|manganate||dark green
CrO4^2-|chromate||yellow
Cr2O7^2-|dichromate||orange; turns green as it oxidises alcohol
CH3COO^-|acetate||the conjugate base of acetic acid
HCOO^-|formate||the conjugate base of formic acid
C2O4^2-|oxalate||in rhubarb leaves; kidney stones with calcium
C6H5O7^3-|citrate||in the Krebs cycle; a food additive
SiO4^4-|orthosilicate||the tetrahedron every silicate is built from
SiO3^2-|metasilicate||chains of tetrahedra; water glass
BO3^3-|borate||in borax and boric acid
AsO4^3-|arsenate||mimics phosphate: a poison
[Fe(CN)6]^4-|hexacyanoferrate(II) (ferrocyanide)||anticaking agent; with Fe³⁺, Prussian blue
[Fe(CN)6]^3-|hexacyanoferrate(III) (ferricyanide)||blueprints (cyanotype)
## molecule
H2|hydrogen||the lightest gas; a fuel that burns to water
N2|nitrogen||78 % of air; held by a triple bond
O2|oxygen||21 % of air; breathed by most life
O3|ozone||the stratospheric layer that absorbs UV; a pollutant near the ground
F2|fluorine||the most reactive element; pale yellow gas
Cl2|chlorine||yellow-green gas; disinfects water
Br2|bromine||red-brown liquid; one of two liquid elements
I2|iodine||grey-black crystals, violet vapour; an antiseptic
P4|white phosphorus||glows in the dark; catches fire in air
S8|sulfur (cyclo-octasulfur)||the yellow crystals of volcanoes
C60|buckminsterfullerene||a carbon football; Nobel prize 1996
H2O|water||the solvent of life; expands on freezing
H2O2|hydrogen peroxide||bleach, antiseptic, rocket oxidant
N2H4|hydrazine||rocket fuel
H2S|hydrogen sulfide||rotten eggs; as toxic as cyanide
PH3|phosphine||a toxic gas; fumigant
SiH4|silane||catches fire in air; source of silicon for chips
B2H6|diborane||bridged by three-centre bonds
BF3|boron trifluoride||a Lewis acid
NF3|nitrogen trifluoride||etches chips; a strong greenhouse gas
PCl3|phosphorus trichloride||makes pesticides and flame retardants
PCl5|phosphorus pentachloride||five bonds around phosphorus
SF6|sulfur hexafluoride||insulates high-voltage switchgear; the strongest greenhouse gas
XeF2|xenon difluoride||a noble gas that reacts
XeF4|xenon tetrafluoride||square planar; noble gas chemistry (1962)
CS2|carbon disulfide||a solvent; makes viscose
NH2Cl|monochloramine||disinfects drinking water; forms from bleach and ammonia
COCl2|phosgene||a chemical weapon of WWI; makes polycarbonates
## organic
CH4|methane||natural gas; a greenhouse gas
C2H6|ethane||in natural gas
C3H8|propane||bottled gas
C4H10|butane||lighter fuel
C6H14|hexane||a solvent; extracts vegetable oils
C8H18|octane||petrol; its rating measures knock
C2H4|ethylene||ripens fruit; makes polyethylene
C2H2|acetylene||burns hot enough to weld
C5H8|isoprene||the unit of natural rubber and terpenes
C8H8|styrene||makes polystyrene
C2H3Cl|vinyl chloride||makes PVC
C6H6|benzene||the aromatic ring (Kekulé, 1865); carcinogenic
C7H8|toluene||a solvent; makes TNT
C10H8|naphthalene||mothballs
CH3OH|methanol||wood alcohol; blinds and kills
C2H5OH|ethanol||the alcohol of drinks; a fuel
(CH3)2CHOH|isopropanol||rubbing alcohol
C2H4(OH)2|ethylene glycol||antifreeze; sweet and toxic
C3H5(OH)3|glycerol||sweet and viscous; the backbone of fats
CH2O|formaldehyde||preserves specimens; makes resins
CH3CHO|acetaldehyde||what ethanol becomes in the liver
(CH3)2CO|acetone||nail-polish remover
(C2H5)2O|diethyl ether||the first surgical anaesthetic (1846)
CH3COOC2H5|ethyl acetate||fruity solvent
CHCl3|chloroform||an early anaesthetic
CCl4|carbon tetrachloride||a former fire extinguisher; destroys ozone
CH2Cl2|dichloromethane||paint stripper; decaffeinates coffee
CO(NH2)2|urea||the first organic compound made from inorganic ones (1828)
C2H5NO2|glycine||the simplest amino acid
C3H7NO2|alanine||an amino acid
C6H12O6|glucose||blood sugar; the fuel of cells
C12H22O11|sucrose||table sugar
C8H10N4O2|caffeine||blocks adenosine receptors
C10H14N2|nicotine||the alkaloid of tobacco
C9H8O4|aspirin (acetylsalicylic acid)||painkiller, blood thinner
C8H9NO2|paracetamol||painkiller and fever reducer
C13H18O2|ibuprofen||anti-inflammatory
C17H19NO3|morphine||the alkaloid of the opium poppy
C16H18N2O4S|penicillin G||the first antibiotic (Fleming, 1928)
C27H46O|cholesterol||in every cell membrane
C10H20O|menthol||the cool of mint
C8H8O3|vanillin||the flavour of vanilla
C40H56|β-carotene||the orange of carrots; vitamin A
C55H72MgN4O5|chlorophyll a||captures light in plants
C10H16N5O13P3|adenosine triphosphate (ATP)||the energy currency of cells
C5H5N5|adenine||a base of DNA and RNA
## acid
HCl|hydrochloric acid|strong · pKa ≈ −6|stomach acid; cleans metals
HBr|hydrobromic acid|strong · pKa ≈ −9|
HI|hydroiodic acid|strong · pKa ≈ −10|the strongest of the hydrohalic acids
HNO3|nitric acid|strong · pKa −1.4|fertilisers, explosives; stains skin yellow
H2SO4|sulfuric acid|strong · pKa ≈ −3, 1.99|the most produced chemical in the world
HClO4|perchloric acid|strong · pKa ≈ −10|
HClO3|chloric acid|strong · pKa ≈ −1|
HF|hydrofluoric acid|pKa 3.17|weak, yet etches glass and goes through skin to bone
HNO2|nitrous acid|pKa 3.35|unstable; diazotisation
HClO|hypochlorous acid|pKa 7.53|the disinfectant of chlorinated water
HClO2|chlorous acid|pKa 1.96|
HIO3|iodic acid|pKa 0.77|
HCN|hydrocyanic acid|pKa 9.21|smells of bitter almonds; a deadly poison
H2S|hydrosulfuric acid|pKa 7.0|hydrogen sulfide in water
H2CO3|carbonic acid|pKa 6.35, 10.33|CO₂ in water: fizzy drinks, acid rain, blood
H2SO3|sulfurous acid|pKa 1.86, 7.2|SO₂ in water
H3PO4|phosphoric acid|pKa 2.15, 7.20, 12.35|the tang of cola; rust remover
H3BO3|boric acid|pKa 9.24|a mild antiseptic; insecticide
H3AsO4|arsenic acid|pKa 2.19, 6.94, 11.5|
HCOOH|formic acid|pKa 3.75|the sting of ants and nettles
CH3COOH|acetic acid|pKa 4.76|vinegar (about 5 %)
C3H7COOH|butyric acid|pKa 4.82|rancid butter
CF3COOH|trifluoroacetic acid|pKa 0.23|a strong organic acid
H2C2O4|oxalic acid|pKa 1.25, 4.27|rhubarb leaves; removes rust
C3H6O3|lactic acid|pKa 3.86|sour milk; tired muscles
C4H6O5|malic acid|pKa 3.40, 5.20|the sour of apples
C4H6O6|tartaric acid|pKa 2.98, 4.34|grapes and wine; cream of tartar
C6H8O7|citric acid|pKa 3.13, 4.76, 6.40|lemons; the Krebs cycle
C6H8O6|ascorbic acid (vitamin C)|pKa 4.10|prevents scurvy
C6H5COOH|benzoic acid|pKa 4.20|a food preservative (E210)
C6H5OH|phenol|pKa 9.95|carbolic acid, Lister’s antiseptic (1867)
C7H6O3|salicylic acid|pKa 2.97|from willow bark; treats acne
C5H4N4O3|uric acid|pKa 5.6|gout and kidney stones
C17H35COOH|stearic acid|pKa ≈ 4.8|a saturated fatty acid; candles and soap
## base
LiOH|lithium hydroxide|strong|scrubs CO₂ in spacecraft
NaOH|sodium hydroxide|strong|caustic soda; soap, drain cleaner
KOH|potassium hydroxide|strong|caustic potash; soft soap, alkaline batteries
CsOH|caesium hydroxide|strong|the strongest of the hydroxides
Ca(OH)2|calcium hydroxide|strong · slightly soluble|slaked lime: mortar, limewater test for CO₂
Sr(OH)2|strontium hydroxide|strong|refines beet sugar
Ba(OH)2|barium hydroxide|strong|titrates weak acids
NH3|ammonia|pKb 4.75|the Haber–Bosch process feeds half the world
NH2OH|hydroxylamine|pKb 8.0|
CH3NH2|methylamine|pKb 3.36|smells of fish
(CH3)2NH|dimethylamine|pKb 3.27|
(CH3)3N|trimethylamine|pKb 4.19|the smell of rotting fish
C5H5N|pyridine|pKb 8.77|a ring like benzene with one nitrogen
C6H5NH2|aniline|pKb 9.37|the mother of synthetic dyes (mauve, 1856)
Mg(OH)2|magnesium hydroxide|weak · insoluble|milk of magnesia, an antacid
Fe(OH)2|iron(II) hydroxide|weak · insoluble|green precipitate, browns in air
Fe(OH)3|iron(III) hydroxide|weak · insoluble|rust-brown precipitate
Cu(OH)2|copper(II) hydroxide|weak · insoluble|pale blue precipitate
Al(OH)3|aluminium hydroxide|amphoteric · insoluble|antacid; dissolves in acids and in bases
Zn(OH)2|zinc hydroxide|amphoteric · insoluble|dissolves in acids and in bases
## oxide
CO|carbon monoxide|neutral|colourless, odourless, deadly: takes the place of oxygen on haemoglobin
CO2|carbon dioxide|acidic|breathed out; the main greenhouse gas; dry ice
NO|nitric oxide|neutral|a messenger in the body; dilates vessels
NO2|nitrogen dioxide|acidic|brown smog
N2O|nitrous oxide|neutral|laughing gas; an anaesthetic
N2O4|dinitrogen tetroxide|acidic|rocket oxidiser; in balance with NO₂
SO2|sulfur dioxide|acidic|volcanoes and coal smoke; acid rain
SO3|sulfur trioxide|acidic|with water, sulfuric acid
P4O10|phosphorus pentoxide|acidic|a powerful drying agent
SiO2|silicon dioxide|acidic|quartz, sand, glass
B2O3|boron trioxide|acidic|borosilicate glass
Na2O|sodium oxide|basic|in glass
K2O|potassium oxide|basic|fertiliser grades are given as K₂O
MgO|magnesium oxide|basic|white light of burning magnesium; refractory
CaO|calcium oxide|basic|quicklime: cement, mortar
Al2O3|aluminium oxide|amphoteric|alumina; corundum, ruby and sapphire
ZnO|zinc oxide|amphoteric|sunscreen, white paint
Fe2O3|iron(III) oxide|amphoteric|rust; haematite
Fe3O4|iron(II,III) oxide|basic|magnetite, the first magnet
FeO|iron(II) oxide|basic|wüstite
Cu2O|copper(I) oxide|basic|red; antifouling paint
CuO|copper(II) oxide|basic|black
TiO2|titanium dioxide|amphoteric|the white of paint, paper and toothpaste
MnO2|manganese dioxide|amphoteric|the cathode of alkaline batteries
Cr2O3|chromium(III) oxide|amphoteric|chrome green pigment
PbO|lead(II) oxide|amphoteric|litharge; lead glass
PbO2|lead(IV) oxide|amphoteric|the cathode of car batteries
SnO2|tin(IV) oxide|amphoteric|cassiterite, the ore of tin
Ag2O|silver(I) oxide|basic|in watch batteries
HgO|mercury(II) oxide|basic|heated, it gave Priestley oxygen (1774)
ZrO2|zirconium dioxide|amphoteric|zirconia ceramics and imitation diamonds
UO2|uranium dioxide|basic|the fuel of nuclear reactors
## salt
NaCl|sodium chloride|soluble|table salt; 3.5 % of seawater with other salts
KCl|potassium chloride|soluble|salt substitute; potash fertiliser
CaCl2|calcium chloride|soluble|de-icing roads; a drying agent
MgCl2|magnesium chloride|soluble|the bitterness of seawater; tofu coagulant
BaCl2|barium chloride|soluble|tests for sulfate; toxic
NH4Cl|ammonium chloride|soluble|sal ammoniac; salty liquorice
AgCl|silver chloride|insoluble|white precipitate that darkens in light
AgBr|silver bromide|insoluble|the light-sensitive grain of photographic film
AgI|silver iodide|insoluble|seeds clouds
PbI2|lead(II) iodide|insoluble|golden rain of crystals
PbCl2|lead(II) chloride|slightly soluble|
CuCl2|copper(II) chloride|soluble|blue-green flame
FeCl3|iron(III) chloride|soluble|etches printed circuit boards
ZnCl2|zinc chloride|soluble|soldering flux
NaF|sodium fluoride|soluble|fluoridates water and toothpaste
CaF2|calcium fluoride|insoluble|fluorite; UV and IR optics
KBr|potassium bromide|soluble|infrared windows; an old sedative
KI|potassium iodide|soluble|protects the thyroid from radioactive iodine
NaHCO3|sodium hydrogen carbonate|soluble|baking soda; antacid
Na2CO3|sodium carbonate|soluble|washing soda; glassmaking
K2CO3|potassium carbonate|soluble|potash, from wood ashes
CaCO3|calcium carbonate|insoluble|limestone, chalk, marble, shells
MgCO3|magnesium carbonate|insoluble|climbers’ chalk
Li2CO3|lithium carbonate|slightly soluble|treats bipolar disorder; makes battery cathodes
BaCO3|barium carbonate|insoluble|rat poison
Na2SO4|sodium sulfate|soluble|Glauber’s salt; detergent filler
K2SO4|potassium sulfate|soluble|fertiliser
CaSO4|calcium sulfate|slightly soluble|anhydrite; plaster when hydrated
BaSO4|barium sulfate|insoluble|swallowed for X-rays of the gut
CuSO4|copper(II) sulfate|soluble|white when anhydrous, blue with water; fungicide
FeSO4|iron(II) sulfate|soluble|iron supplement
ZnSO4|zinc sulfate|soluble|zinc supplement
(NH4)2SO4|ammonium sulfate|soluble|fertiliser
Al2(SO4)3|aluminium sulfate|soluble|clarifies drinking water
NaNO3|sodium nitrate|soluble|Chile saltpetre
KNO3|potassium nitrate|soluble|saltpetre: three quarters of gunpowder
NH4NO3|ammonium nitrate|soluble|fertiliser and explosive
AgNO3|silver nitrate|soluble|lunar caustic; tests for halides
Pb(NO3)2|lead(II) nitrate|soluble|
NaNO2|sodium nitrite|soluble|keeps cured meat pink
Na3PO4|trisodium phosphate|soluble|a strong cleaner
Ca3(PO4)2|calcium phosphate|insoluble|bone ash; fertiliser
(NH4)2HPO4|diammonium phosphate|soluble|fertiliser; fire retardant
KMnO4|potassium permanganate|soluble|a purple disinfectant and oxidant
K2Cr2O7|potassium dichromate|soluble|orange oxidant; old breathalysers
K2CrO4|potassium chromate|soluble|yellow; indicator in titrations
KClO3|potassium chlorate|soluble|match heads
NaClO|sodium hypochlorite|soluble|household bleach
Ca(ClO)2|calcium hypochlorite|soluble|pool chlorine
NH4ClO4|ammonium perchlorate|soluble|the oxidant of solid rocket boosters
NaCN|sodium cyanide|soluble|extracts gold from ore
KCN|potassium cyanide|soluble|a fast poison
KSCN|potassium thiocyanate|soluble|tests for Fe³⁺
K4[Fe(CN)6]|potassium ferrocyanide|soluble|anticaking agent (E536)
Fe4[Fe(CN)6]3|Prussian blue|insoluble|the first modern synthetic pigment (1706)
Na2S2O3|sodium thiosulfate|soluble|“hypo”, the photographic fixer
Na2SO3|sodium sulfite|soluble|food preservative
Na2S|sodium sulfide|soluble|removes hair from hides
ZnS|zinc sulfide|insoluble|glows in phosphors
CdS|cadmium sulfide|insoluble|cadmium yellow pigment
CH3COONa|sodium acetate|soluble|reusable hand warmers
CaC2O4|calcium oxalate|insoluble|most kidney stones
Na2SiO3|sodium silicate|soluble|water glass
NaN3|sodium azide|soluble|inflates airbags
NaBH4|sodium borohydride|soluble|reduces aldehydes and ketones
LiAlH4|lithium aluminium hydride|reacts with water|a powerful reducing agent
CaC2|calcium carbide|reacts with water|gives acetylene for carbide lamps
CuSO4·5H2O|copper(II) sulfate pentahydrate|soluble|blue vitriol
FeSO4·7H2O|iron(II) sulfate heptahydrate|soluble|green vitriol
MgSO4·7H2O|magnesium sulfate heptahydrate|soluble|Epsom salt
CaSO4·2H2O|calcium sulfate dihydrate|slightly soluble|gypsum; plasterboard
(CaSO4)2·H2O|calcium sulfate hemihydrate|slightly soluble|plaster of Paris: sets back into gypsum
Na2CO3·10H2O|sodium carbonate decahydrate|soluble|washing soda crystals
Na2B4O7·10H2O|borax|soluble|flux, cleaner, slime
KAl(SO4)2·12H2O|potassium alum|soluble|stops bleeding; fixes dyes
CoCl2·6H2O|cobalt(II) chloride hexahydrate|soluble|pink when wet, blue when dry: a humidity indicator
Na2S2O3·5H2O|sodium thiosulfate pentahydrate|soluble|hypo crystals`;

  /* ---------------- reading the list ---------------- */

  var list = [], cat = '';
  DATA.split('\n').forEach(function (l) {
    if (l.indexOf('## ') === 0) { cat = l.slice(3); return; }
    var f = l.split('|');
    list.push({ f: f[0], name: f[1], fig: f[2] || '', note: f[3] || '', cat: cat });
  });
  function carbon(f) { return /C(?![a-z])/.test(f); }   // C, but not Cl, Ca, Cu, Cr, Cs, Co, Cd
  function kind(c) { // shown above the formula
    var f = c.f, fig = c.fig;
    switch (c.cat) {
      case 'cation': case 'anion':
        return f[0] === '[' ? 'complex ' + c.cat : /^[A-Z][a-z]?\^/.test(f) ? c.cat : 'polyatomic ' + c.cat;
      case 'molecule': return /^[A-Z][a-z]?\d*$/.test(f) ? 'element · molecule' : 'molecule';
      case 'organic': return 'organic molecule';
      case 'acid': return /^strong/.test(fig) ? 'strong acid' : carbon(f) && f !== 'HCN' && f !== 'H2CO3' ? 'organic acid · weak' : 'weak acid';
      case 'base': return /^strong/.test(fig) ? 'strong base' : /^amphoteric/.test(fig) ? 'amphoteric hydroxide' : carbon(f) ? 'organic base · weak' : 'weak base';
      case 'oxide': return fig + ' oxide';
      case 'salt': return f.indexOf('·') > 0 ? 'salt · hydrate' : 'salt';
    }
    return c.cat;
  }
  list.forEach(function (c) { c.kind = kind(c); });

  /* ---------------- formulas ---------------- */

  function tokens(f) { // [[text, 0 normal | 1 subscript | 2 superscript]]
    var out = [], i = 0, buf = '', mode = 0;
    function flush() { if (buf) out.push([buf, mode]); buf = ''; }
    while (i < f.length) {
      var ch = f[i];
      if (ch === '^') { flush(); mode = 2; i++; continue; }
      if (mode === 2) { buf += ch === '-' ? '−' : ch; i++; continue; }
      var isDigit = ch >= '0' && ch <= '9', prev = f[i - 1] || '';
      var sub = isDigit && (/[A-Za-z)\]]/.test(prev) || (mode === 1));
      if (sub && mode !== 1) { flush(); mode = 1; }
      if (!sub && mode === 1) { flush(); mode = 0; }
      buf += ch; i++;
    }
    flush();
    return out;
  }
  function html(f) { return tokens(f).map(function (t) { return t[1] === 1 ? '<sub>' + t[0] + '</sub>' : t[1] === 2 ? '<sup>' + t[0] + '</sup>' : t[0]; }).join(''); }
  // how many atoms of each element: brackets (round or square), hydrates (·5H2O), the charge ignored
  function count(f) {
    var tot = {};
    f.split('^')[0].split('·').forEach(function (part) {
      var coef = 1, m = /^(\d+)(.*)$/.exec(part); if (m) { coef = +m[1]; part = m[2]; }
      var i = 0;
      function group() {
        var t = {};
        while (i < part.length && part[i] !== ')' && part[i] !== ']') {
          var g;
          if (part[i] === '(' || part[i] === '[') { i++; g = group(); i++; }
          else { var e = /^[A-Z][a-z]?/.exec(part.slice(i))[0]; i += e.length; g = {}; g[e] = 1; }
          var n = /^\d+/.exec(part.slice(i)), k = 1; if (n) { i += n[0].length; k = +n[0]; }
          for (var s in g) t[s] = (t[s] || 0) + g[s] * k;
        }
        return t;
      }
      var g = group();
      for (var s in g) tot[s] = (tot[s] || 0) + g[s] * coef;
    });
    return tot;
  }
  var MASS = {};
  (window.PERIODIC_ELEMENTS || []).forEach(function (e) { MASS[e.sym] = parseFloat(e.mass.replace(/[\[\]]/g, '')); });
  function molarMass(f) { var c = count(f), m = 0; for (var s in c) m += c[s] * (MASS[s] || 0); return m; }

  return { list: list, tokens: tokens, html: html, count: count, molarMass: molarMass, MASS: MASS };
})();
