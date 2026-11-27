/* Common minerals and their crystallography, for the Minerals page of Geology.
   One line per mineral, grouped by chemical class (## class):
   formula | name | crystal system | space group | Mohs hardness | density (g/cm³) | lustre | colour | streak | cleavage | habit | note
   The Bravais lattice follows from the system and the first letter of the space
   group (P primitive, I body-centred, F face-centred, C base-centred, R rhombohedral). */
window.Minerals = (function () {
  var DATA = `## native element
C|diamond|cubic|Fd3̄m|10|3.52|adamantine|colourless, yellow, brown|colourless|perfect octahedral {111}|octahedra|each carbon bound to four others in tetrahedra: the hardest natural material
C|graphite|hexagonal|P6₃/mmc|1–2|2.23|metallic to earthy|black, steel-grey|black|perfect basal {0001}|tabular flakes|sheets of hexagonal carbon rings, held by weak forces: they slide
Au|gold|cubic|Fm3̄m|2.5–3|19.3|metallic|gold-yellow|gold-yellow|none|nuggets, grains, dendrites|malleable: one gram beats into a square metre of leaf
Cu|copper|cubic|Fm3̄m|2.5–3|8.96|metallic|copper-red, tarnishing brown|copper-red|none|dendrites, wires|the first metal worked by humans
S8|sulfur|orthorhombic|Fddd|1.5–2.5|2.07|resinous|yellow|white|poor|dipyramids, crusts|rings of eight atoms; around volcanic vents
## silicate
SiO2|quartz|trigonal|P3₁21|7|2.65|vitreous|colourless, white; purple (amethyst), smoky|white|none; conchoidal fracture|hexagonal prisms ending in pyramids|a framework of SiO₄ tetrahedra spiralling along c: left- and right-handed crystals; piezoelectric
Mg2SiO4|forsterite (olivine)|orthorhombic|Pbnm|7|3.27|vitreous|olive green|white|poor|granular|isolated tetrahedra; the main mineral of the upper mantle; gem: peridot
Al2SiO5|kyanite|triclinic|P1̄|4.5–7|3.61|vitreous|blue|white|perfect {100}|long blades|its hardness depends on direction: 4.5 along the blade, 7 across
Al2SiO4F2|topaz|orthorhombic|Pbnm|8|3.53|vitreous|colourless, yellow, blue|white|perfect basal {001}|prismatic|number 8 on Mohs’ scale
Be3Al2Si6O18|beryl|hexagonal|P6/mcc|7.5–8|2.76|vitreous|green (emerald), blue (aquamarine)|white|poor basal|hexagonal prisms|rings of six tetrahedra stacked into channels
ZrSiO4|zircon|tetragonal|I4₁/amd|7.5|4.65|adamantine|brown, colourless|white|poor|square prisms ending in pyramids|traps uranium, not lead: the oldest dated crystals on Earth (4.4 billion years)
Fe3Al2(SiO4)3|almandine (garnet)|cubic|Ia3̄d|7–7.5|4.32|vitreous|deep red|white|none|rhombic dodecahedra|a garnet of metamorphic rocks
KAlSi3O8|orthoclase|monoclinic|C2/m|6|2.56|vitreous|pink, white|white|perfect {001}, good {010}, at 90°|prismatic; Carlsbad twins|a feldspar, the pink of granite
NaAlSi3O8|albite|triclinic|C1̄|6–6.5|2.62|vitreous|white|white|perfect {001}, good {010}, at 86°|tabular; fine striations from twinning|a plagioclase feldspar
KAl3Si3O10(OH)2|muscovite|monoclinic|C2/c|2–2.5|2.82|vitreous to pearly|colourless, silvery|white|perfect basal {001}|stacked sheets (“books”)|a mica: sheets of tetrahedra, split into clear flexible leaves
Al2Si2O5(OH)4|kaolinite|triclinic|C1|2–2.5|2.6|earthy, dull|white|white|perfect {001}|clay masses of tiny plates|china clay: porcelain and paper
Mg3Si4O10(OH)2|talc|triclinic|C1̄|1|2.75|pearly, greasy|white, pale green|white|perfect {001}|foliated masses|number 1 on Mohs’ scale; soapstone
## carbonate
CaCO3|calcite|trigonal|R3̄c|3|2.71|vitreous|colourless, white|white|perfect rhombohedral, three directions at 75°|scalenohedra, rhombohedra|fizzes in cold dilute acid; a clear crystal doubles images (birefringence)
CaCO3|aragonite|orthorhombic|Pmcn|3.5–4|2.95|vitreous|white|white|poor {010}|needles; pseudo-hexagonal twins|the same CaCO₃ as calcite, packed denser: mother-of-pearl
CaMg(CO3)2|dolomite|trigonal|R3̄|3.5–4|2.85|vitreous to pearly|white, pink|white|perfect rhombohedral|curved, saddle-shaped rhombs|fizzes only when powdered; the Dolomites
FeCO3|siderite|trigonal|R3̄c|3.5–4.5|3.96|vitreous|brown|white|perfect rhombohedral|rhombohedra|an ore of iron
Cu2CO3(OH)2|malachite|monoclinic|P2₁/a|3.5–4|4.0|silky to adamantine|green, banded|pale green|perfect {201̄}|botryoidal, banded masses|weathers from copper ores
Cu3(CO3)2(OH)2|azurite|monoclinic|P2₁/c|3.5–4|3.77|vitreous|azure blue|light blue|perfect {011}|prismatic|blue pigment of old paintings; turns to malachite
## halide
NaCl|halite|cubic|Fm3̄m|2.5|2.17|vitreous|colourless, white|white|perfect cubic, three directions at 90°|cubes|rock salt: Na⁺ and Cl⁻ alternating on a cubic grid; tastes salty
KCl|sylvite|cubic|Fm3̄m|2|1.99|vitreous|colourless, white, reddish|white|perfect cubic|cubes|potash ore; tastes bitter
CaF2|fluorite|cubic|Fm3̄m|4|3.18|vitreous|purple, green, yellow, colourless|white|perfect octahedral {111}|cubes, octahedra|number 4 on Mohs’ scale; gave its name to fluorescence
## sulfate
CaSO4·2H2O|gypsum|monoclinic|C2/c|2|2.31|vitreous to pearly|colourless, white|white|perfect {010}|tabular; swallowtail twins; desert roses|number 2 on Mohs’ scale: scratched by a fingernail
BaSO4|baryte|orthorhombic|Pnma|3–3.5|4.48|vitreous|white, colourless|white|perfect {001}, good {210}|tabular; desert roses|heavy spar: strikingly heavy for a pale mineral
## phosphate
Ca5(PO4)3OH|hydroxyapatite|hexagonal|P6₃/m|5|3.1|vitreous|white, green, blue|white|poor|hexagonal prisms|number 5 on Mohs’ scale; the mineral of bones and teeth
## sulfide
FeS2|pyrite|cubic|Pa3̄|6–6.5|5.01|metallic|brass-yellow|greenish black|none|striated cubes, pyritohedra|fool’s gold; sparks against steel
PbS|galena|cubic|Fm3̄m|2.5|7.6|metallic|lead-grey|lead-grey|perfect cubic|cubes|the ore of lead; the crystal of early radios
ZnS|sphalerite|cubic|F4̄3m|3.5–4|4.05|resinous to adamantine|brown, black, yellow|pale yellow-brown|perfect dodecahedral, six directions|tetrahedra|the ore of zinc; the zinc-blende structure of semiconductors
HgS|cinnabar|trigonal|P3₁21|2–2.5|8.1|adamantine|scarlet|scarlet|perfect prismatic|rhombohedra, crusts|vermilion; the ore of mercury
CuFeS2|chalcopyrite|tetragonal|I4̄2d|3.5–4|4.2|metallic|brass-yellow, iridescent tarnish|greenish black|poor|tetrahedron-like crystals|the main ore of copper; softer and yellower than pyrite
## oxide and hydroxide
H2O|ice|hexagonal|P6₃/mmc|1.5|0.917|vitreous|colourless, white|white|none|hexagonal plates; snowflakes|lighter than water: hydrogen bonds hold it open; a mineral of glaciers
Al2O3|corundum|trigonal|R3̄c|9|4.02|adamantine to vitreous|colourless; red (ruby, Cr), blue (sapphire, Fe and Ti)|white|none; parting|barrel-shaped hexagonal prisms|number 9 on Mohs’ scale; emery
Fe2O3|haematite|trigonal|R3̄c|5.5–6.5|5.26|metallic to earthy|steel-grey, red|reddish brown|none|tabular; kidney-shaped masses|red ochre; the main ore of iron
Fe3O4|magnetite|cubic|Fd3̄m|5.5–6.5|5.18|metallic|black|black|none|octahedra|strongly magnetic: lodestone
FeO(OH)|goethite|orthorhombic|Pbnm|5–5.5|4.27|adamantine to earthy|yellow-brown|yellowish brown|perfect {010}|botryoidal; earthy|yellow ochre; named after Goethe
TiO2|rutile|tetragonal|P4₂/mnm|6–6.5|4.25|adamantine|red-brown|pale brown|good {110}|needles, often inside quartz|titanium ore; the brilliant white pigment
SnO2|cassiterite|tetragonal|P4₂/mnm|6–7|6.99|adamantine|brown-black|white to pale brown|poor|prisms; knee-shaped twins|the ore of tin, of the Bronze Age
UO2|uraninite|cubic|Fm3̄m|5–6|8–10.9|submetallic, pitchy|black|brownish black|none|massive; botryoidal (pitchblende)|where radium and polonium were found (1898)`;

  var list = [], cls = '';
  DATA.split('\n').forEach(function (l) {
    if (l.indexOf('## ') === 0) { cls = l.slice(3); return; }
    var f = l.split('|');
    var m = { f: f[0], name: f[1], system: f[2], sg: f[3], mohs: f[4], rho: f[5], lustre: f[6], colour: f[7], streak: f[8],
              cleavage: f[9], habit: f[10], note: f[11], cls: cls };
    var c = m.sg[0], lat = { triclinic: 'a', monoclinic: 'm', orthorhombic: 'o', tetragonal: 't', hexagonal: 'h', trigonal: 'h', cubic: 'c' }[m.system];
    m.lattice = c === 'R' ? 'hR' : lat + (lat === 'a' ? 'P' : c === 'A' || c === 'B' ? 'C' : c);   // triclinic is always primitive
    list.push(m);
  });

  /* ---------------- the fourteen Bravais lattices ---------------- */

  var D = Math.PI / 180;
  var SYSTEMS = { // representative cell parameters (a, b, c, α, β, γ) and the constraints that define the system
    triclinic:    { p: [1, 1.25, 1.5, 78, 105, 95],  rule: 'a ≠ b ≠ c,  α ≠ β ≠ γ', sym: 'no axis of symmetry above 1 (at most a centre)' },
    monoclinic:   { p: [1, 1.25, 1.5, 90, 112, 90],  rule: 'a ≠ b ≠ c,  α = γ = 90° ≠ β', sym: 'one 2-fold axis (or mirror plane)' },
    orthorhombic: { p: [1, 1.3, 1.65, 90, 90, 90],   rule: 'a ≠ b ≠ c,  α = β = γ = 90°', sym: 'three perpendicular 2-fold axes (or mirrors)' },
    tetragonal:   { p: [1, 1, 1.55, 90, 90, 90],     rule: 'a = b ≠ c,  α = β = γ = 90°', sym: 'one 4-fold axis' },
    trigonal:     { p: [1.15, 1.15, 1.15, 70, 70, 70], rule: 'a = b = c,  α = β = γ ≠ 90° (rhombohedral axes)', sym: 'one 3-fold axis' },
    hexagonal:    { p: [1, 1, 1.6, 90, 90, 120],     rule: 'a = b ≠ c,  α = β = 90°,  γ = 120°', sym: 'one 6-fold axis (the hexagonal lattice also serves trigonal crystals)' },
    cubic:        { p: [1, 1, 1, 90, 90, 90],        rule: 'a = b = c,  α = β = γ = 90°', sym: 'four 3-fold axes along the body diagonals' }
  };
  var CENTRE = { P: 'primitive', I: 'body-centred', F: 'face-centred', C: 'base-centred', R: 'rhombohedral' };
  var LATTICES = [
    ['aP', 'triclinic', 'P'], ['mP', 'monoclinic', 'P'], ['mC', 'monoclinic', 'C'],
    ['oP', 'orthorhombic', 'P'], ['oC', 'orthorhombic', 'C'], ['oI', 'orthorhombic', 'I'], ['oF', 'orthorhombic', 'F'],
    ['tP', 'tetragonal', 'P'], ['tI', 'tetragonal', 'I'], ['hR', 'trigonal', 'R'], ['hP', 'hexagonal', 'P'],
    ['cP', 'cubic', 'P'], ['cI', 'cubic', 'I'], ['cF', 'cubic', 'F']
  ].map(function (l) { return { id: l[0], system: l[1], c: l[2], name: (CENTRE[l[2]] === 'rhombohedral' ? 'rhombohedral' : CENTRE[l[2]] + ' ' + l[1]) }; });
  function basis(system) { // the cell vectors from a, b, c, α, β, γ
    var p = SYSTEMS[system].p, a = p[0], b = p[1], c = p[2], al = p[3] * D, be = p[4] * D, ga = p[5] * D;
    var cx = c * Math.cos(be), cy = c * (Math.cos(al) - Math.cos(be) * Math.cos(ga)) / Math.sin(ga);
    return [[a, 0, 0], [b * Math.cos(ga), b * Math.sin(ga), 0], [cx, cy, Math.sqrt(Math.max(0, c * c - cx * cx - cy * cy))]];
  }
  function points(c) { // lattice points of one conventional cell, in fractions of the cell vectors: [u, v, w, centring?]
    var pts = [], i, j, k;
    for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) for (k = 0; k < 2; k++) pts.push([i, j, k, 0]);
    if (c === 'I') pts.push([.5, .5, .5, 1]);
    if (c === 'C') pts.push([.5, .5, 0, 1], [.5, .5, 1, 1]);
    if (c === 'F') [[.5, .5, 0], [.5, .5, 1], [.5, 0, .5], [.5, 1, .5], [0, .5, .5], [1, .5, .5]].forEach(function (q) { pts.push([q[0], q[1], q[2], 1]); });
    return pts;
  }
  return { list: list, SYSTEMS: SYSTEMS, LATTICES: LATTICES, basis: basis, points: points };
})();
