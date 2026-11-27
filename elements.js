/* The 118 elements of the periodic table, shared by the Chemistry background (orbitals.js)
   and the periodic table page (periodic-table.js).
   Z | symbol | name | standard atomic weight, or [mass number of the longest-lived isotope] | discovered by (year)
     | category | ground-state electron configuration (predicted from Z = 109) | Pauling electronegativity
     | first ionisation energy (kJ/mol) | common oxidation states | melting point (K) | boiling point (K)
     | density (g/cm³; gases: g/L at 0 °C) | state at 25 °C */
window.PERIODIC_ELEMENTS = `1|H|Hydrogen|1.008|Henry Cavendish (1766)|nonmetal|1s1|2.20|1312|−1, +1|13.99|20.27|0.0899|gas
2|He|Helium|4.0026|Pierre Janssen, Norman Lockyer (1868)|noble gas|1s2||2372|0|0.95 (at 2.5 MPa)|4.22|0.1785|gas
3|Li|Lithium|6.94|Johan August Arfwedson (1817)|alkali metal|[He] 2s1|0.98|520|+1|453.65|1603|0.534|solid
4|Be|Beryllium|9.0122|Louis-Nicolas Vauquelin (1798)|alkaline earth metal|[He] 2s2|1.57|900|+2|1560|2742|1.85|solid
5|B|Boron|10.81|Joseph Louis Gay-Lussac, Louis Jacques Thénard, Humphry Davy (1808)|metalloid|[He] 2s2 2p1|2.04|801|+3|2349|4200|2.34|solid
6|C|Carbon|12.011|known since antiquity|nonmetal|[He] 2s2 2p2|2.55|1086|−4, +2, +4||3915 (sublimes)|2.267|solid
7|N|Nitrogen|14.007|Daniel Rutherford (1772)|nonmetal|[He] 2s2 2p3|3.04|1402|−3, +3, +5|63.15|77.36|1.251|gas
8|O|Oxygen|15.999|Carl Wilhelm Scheele, Joseph Priestley (1771–1774)|nonmetal|[He] 2s2 2p4|3.44|1314|−2|54.36|90.19|1.429|gas
9|F|Fluorine|18.998|Henri Moissan (1886)|halogen|[He] 2s2 2p5|3.98|1681|−1|53.48|85.03|1.696|gas
10|Ne|Neon|20.180|William Ramsay, Morris Travers (1898)|noble gas|[He] 2s2 2p6||2081|0|24.56|27.07|0.9002|gas
11|Na|Sodium|22.990|Humphry Davy (1807)|alkali metal|[Ne] 3s1|0.93|496|+1|370.94|1156|0.968|solid
12|Mg|Magnesium|24.305|Joseph Black (1755)|alkaline earth metal|[Ne] 3s2|1.31|738|+2|923|1363|1.738|solid
13|Al|Aluminium|26.982|Hans Christian Ørsted (1825)|post-transition metal|[Ne] 3s2 3p1|1.61|578|+3|933.47|2792|2.70|solid
14|Si|Silicon|28.085|Jöns Jacob Berzelius (1824)|metalloid|[Ne] 3s2 3p2|1.90|787|−4, +4|1687|3538|2.329|solid
15|P|Phosphorus|30.974|Hennig Brand (1669)|nonmetal|[Ne] 3s2 3p3|2.19|1012|−3, +3, +5|317.3 (white)|553.7|1.823|solid
16|S|Sulfur|32.06|known since antiquity|nonmetal|[Ne] 3s2 3p4|2.58|1000|−2, +2, +4, +6|388.36|717.8|2.07|solid
17|Cl|Chlorine|35.45|Carl Wilhelm Scheele (1774)|halogen|[Ne] 3s2 3p5|3.16|1251|−1, +1, +3, +5, +7|171.6|239.11|3.214|gas
18|Ar|Argon|39.95|Lord Rayleigh, William Ramsay (1894)|noble gas|[Ne] 3s2 3p6||1521|0|83.81|87.30|1.784|gas
19|K|Potassium|39.098|Humphry Davy (1807)|alkali metal|[Ar] 4s1|0.82|419|+1|336.53|1032|0.89|solid
20|Ca|Calcium|40.078|Humphry Davy (1808)|alkaline earth metal|[Ar] 4s2|1.00|590|+2|1115|1757|1.55|solid
21|Sc|Scandium|44.956|Lars Fredrik Nilson (1879)|transition metal|[Ar] 3d1 4s2|1.36|633|+3|1814|3109|2.985|solid
22|Ti|Titanium|47.867|William Gregor (1791)|transition metal|[Ar] 3d2 4s2|1.54|659|+2, +3, +4|1941|3560|4.506|solid
23|V|Vanadium|50.942|Andrés Manuel del Río (1801)|transition metal|[Ar] 3d3 4s2|1.63|651|+2, +3, +4, +5|2183|3680|6.0|solid
24|Cr|Chromium|51.996|Louis-Nicolas Vauquelin (1797)|transition metal|[Ar] 3d5 4s1|1.66|653|+2, +3, +6|2180|2944|7.19|solid
25|Mn|Manganese|54.938|Johan Gottlieb Gahn (1774)|transition metal|[Ar] 3d5 4s2|1.55|717|+2, +3, +4, +6, +7|1519|2334|7.21|solid
26|Fe|Iron|55.845|known since antiquity|transition metal|[Ar] 3d6 4s2|1.83|763|+2, +3|1811|3134|7.874|solid
27|Co|Cobalt|58.933|Georg Brandt (1735)|transition metal|[Ar] 3d7 4s2|1.88|760|+2, +3|1768|3200|8.90|solid
28|Ni|Nickel|58.693|Axel Fredrik Cronstedt (1751)|transition metal|[Ar] 3d8 4s2|1.91|737|+2|1728|3186|8.908|solid
29|Cu|Copper|63.546|known since antiquity|transition metal|[Ar] 3d10 4s1|1.90|745|+1, +2|1357.77|2835|8.96|solid
30|Zn|Zinc|65.38|Andreas Sigismund Marggraf (1746)|transition metal|[Ar] 3d10 4s2|1.65|906|+2|692.68|1180|7.14|solid
31|Ga|Gallium|69.723|Paul-Émile Lecoq de Boisbaudran (1875)|post-transition metal|[Ar] 3d10 4s2 4p1|1.81|579|+3|302.91|2673|5.91|solid
32|Ge|Germanium|72.630|Clemens Winkler (1886)|metalloid|[Ar] 3d10 4s2 4p2|2.01|762|−4, +2, +4|1211.40|3106|5.323|solid
33|As|Arsenic|74.922|Albertus Magnus (c. 1250)|metalloid|[Ar] 3d10 4s2 4p3|2.18|947|−3, +3, +5|1090 (at 3.6 MPa)|887 (sublimes)|5.727|solid
34|Se|Selenium|78.971|Jöns Jacob Berzelius (1817)|nonmetal|[Ar] 3d10 4s2 4p4|2.55|941|−2, +4, +6|494|958|4.81|solid
35|Br|Bromine|79.904|Carl Löwig, Antoine Jérôme Balard (1825–1826)|halogen|[Ar] 3d10 4s2 4p5|2.96|1140|−1, +1, +3, +5|265.8|332.0|3.1028|liquid
36|Kr|Krypton|83.798|William Ramsay, Morris Travers (1898)|noble gas|[Ar] 3d10 4s2 4p6|3.00|1351|0, +2|115.78|119.93|3.749|gas
37|Rb|Rubidium|85.468|Robert Bunsen, Gustav Kirchhoff (1861)|alkali metal|[Kr] 5s1|0.82|403|+1|312.46|961|1.532|solid
38|Sr|Strontium|87.62|Adair Crawford (1790)|alkaline earth metal|[Kr] 5s2|0.95|550|+2|1050|1650|2.64|solid
39|Y|Yttrium|88.906|Johan Gadolin (1794)|transition metal|[Kr] 4d1 5s2|1.22|600|+3|1799|3203|4.472|solid
40|Zr|Zirconium|91.224|Martin Heinrich Klaproth (1789)|transition metal|[Kr] 4d2 5s2|1.33|640|+4|2128|4650|6.52|solid
41|Nb|Niobium|92.906|Charles Hatchett (1801)|transition metal|[Kr] 4d4 5s1|1.6|652|+3, +5|2750|5017|8.57|solid
42|Mo|Molybdenum|95.95|Carl Wilhelm Scheele (1778)|transition metal|[Kr] 4d5 5s1|2.16|684|+4, +6|2896|4912|10.28|solid
43|Tc|Technetium|[98]|Carlo Perrier, Emilio Segrè (1937)|transition metal|[Kr] 4d5 5s2|1.9|702|+4, +7|2430|4538|11|solid
44|Ru|Ruthenium|101.07|Karl Ernst Claus (1844)|transition metal|[Kr] 4d7 5s1|2.2|710|+3, +4, +8|2607|4423|12.45|solid
45|Rh|Rhodium|102.91|William Hyde Wollaston (1804)|transition metal|[Kr] 4d8 5s1|2.28|720|+3|2237|3968|12.41|solid
46|Pd|Palladium|106.42|William Hyde Wollaston (1802)|transition metal|[Kr] 4d10|2.20|804|+2, +4|1828.05|3236|12.023|solid
47|Ag|Silver|107.87|known since antiquity|transition metal|[Kr] 4d10 5s1|1.93|731|+1|1234.93|2435|10.49|solid
48|Cd|Cadmium|112.41|Friedrich Stromeyer (1817)|transition metal|[Kr] 4d10 5s2|1.69|868|+2|594.22|1040|8.65|solid
49|In|Indium|114.82|Ferdinand Reich, Hieronymus Theodor Richter (1863)|post-transition metal|[Kr] 4d10 5s2 5p1|1.78|558|+1, +3|429.75|2345|7.31|solid
50|Sn|Tin|118.71|known since antiquity|post-transition metal|[Kr] 4d10 5s2 5p2|1.96|709|+2, +4|505.08|2875|7.265|solid
51|Sb|Antimony|121.76|known since antiquity|metalloid|[Kr] 4d10 5s2 5p3|2.05|834|−3, +3, +5|903.78|1908|6.697|solid
52|Te|Tellurium|127.60|Franz-Joseph Müller von Reichenstein (1782)|metalloid|[Kr] 4d10 5s2 5p4|2.1|869|−2, +4, +6|722.66|1261|6.24|solid
53|I|Iodine|126.90|Bernard Courtois (1811)|halogen|[Kr] 4d10 5s2 5p5|2.66|1008|−1, +1, +5, +7|386.85|457.4|4.933|solid
54|Xe|Xenon|131.29|William Ramsay, Morris Travers (1898)|noble gas|[Kr] 4d10 5s2 5p6|2.6|1170|0, +2, +4, +6|161.4|165.03|5.894|gas
55|Cs|Caesium|132.91|Robert Bunsen, Gustav Kirchhoff (1860)|alkali metal|[Xe] 6s1|0.79|376|+1|301.59|944|1.93|solid
56|Ba|Barium|137.33|Carl Wilhelm Scheele (1772)|alkaline earth metal|[Xe] 6s2|0.89|503|+2|1000|2118|3.51|solid
57|La|Lanthanum|138.91|Carl Gustaf Mosander (1839)|lanthanide|[Xe] 5d1 6s2|1.10|538|+3|1193|3737|6.162|solid
58|Ce|Cerium|140.12|Jöns Jacob Berzelius, Wilhelm Hisinger, Martin Heinrich Klaproth (1803)|lanthanide|[Xe] 4f1 5d1 6s2|1.12|534|+3, +4|1068|3716|6.770|solid
59|Pr|Praseodymium|140.91|Carl Auer von Welsbach (1885)|lanthanide|[Xe] 4f3 6s2|1.13|527|+3|1208|3793|6.77|solid
60|Nd|Neodymium|144.24|Carl Auer von Welsbach (1885)|lanthanide|[Xe] 4f4 6s2|1.14|533|+3|1297|3347|7.01|solid
61|Pm|Promethium|[145]|Jacob Marinsky, Lawrence Glendenin, Charles Coryell (1945)|lanthanide|[Xe] 4f5 6s2|1.13|540|+3|1315|3273|7.26|solid
62|Sm|Samarium|150.36|Paul-Émile Lecoq de Boisbaudran (1879)|lanthanide|[Xe] 4f6 6s2|1.17|545|+2, +3|1345|2067|7.52|solid
63|Eu|Europium|151.96|Eugène-Anatole Demarçay (1901)|lanthanide|[Xe] 4f7 6s2|1.2|547|+2, +3|1099|1802|5.264|solid
64|Gd|Gadolinium|157.25|Jean Charles Galissard de Marignac (1880)|lanthanide|[Xe] 4f7 5d1 6s2|1.2|593|+3|1585|3546|7.90|solid
65|Tb|Terbium|158.93|Carl Gustaf Mosander (1843)|lanthanide|[Xe] 4f9 6s2|1.1|566|+3, +4|1629|3503|8.23|solid
66|Dy|Dysprosium|162.50|Paul-Émile Lecoq de Boisbaudran (1886)|lanthanide|[Xe] 4f10 6s2|1.22|573|+3|1680|2840|8.540|solid
67|Ho|Holmium|164.93|Marc Delafontaine, Jacques-Louis Soret, Per Teodor Cleve (1878)|lanthanide|[Xe] 4f11 6s2|1.23|581|+3|1734|2993|8.79|solid
68|Er|Erbium|167.26|Carl Gustaf Mosander (1843)|lanthanide|[Xe] 4f12 6s2|1.24|589|+3|1802|3141|9.066|solid
69|Tm|Thulium|168.93|Per Teodor Cleve (1879)|lanthanide|[Xe] 4f13 6s2|1.25|597|+3|1818|2223|9.32|solid
70|Yb|Ytterbium|173.05|Jean Charles Galissard de Marignac (1878)|lanthanide|[Xe] 4f14 6s2|1.1|603|+2, +3|1097|1469|6.90|solid
71|Lu|Lutetium|174.97|Georges Urbain, Carl Auer von Welsbach, Charles James (1907)|lanthanide|[Xe] 4f14 5d1 6s2|1.27|524|+3|1925|3675|9.841|solid
72|Hf|Hafnium|178.49|Dirk Coster, George de Hevesy (1923)|transition metal|[Xe] 4f14 5d2 6s2|1.3|659|+4|2506|4876|13.31|solid
73|Ta|Tantalum|180.95|Anders Gustaf Ekeberg (1802)|transition metal|[Xe] 4f14 5d3 6s2|1.5|761|+5|3290|5731|16.69|solid
74|W|Tungsten|183.84|Juan José Elhuyar, Fausto Elhuyar (1783)|transition metal|[Xe] 4f14 5d4 6s2|2.36|770|+4, +6|3695|6203|19.25|solid
75|Re|Rhenium|186.21|Walter Noddack, Ida Tacke, Otto Berg (1925)|transition metal|[Xe] 4f14 5d5 6s2|1.9|760|+4, +7|3459|5869|21.02|solid
76|Os|Osmium|190.23|Smithson Tennant (1803)|transition metal|[Xe] 4f14 5d6 6s2|2.2|840|+4, +8|3306|5285|22.59|solid
77|Ir|Iridium|192.22|Smithson Tennant (1803)|transition metal|[Xe] 4f14 5d7 6s2|2.20|880|+3, +4|2719|4701|22.56|solid
78|Pt|Platinum|195.08|Antonio de Ulloa (1748)|transition metal|[Xe] 4f14 5d9 6s1|2.28|870|+2, +4|2041.4|4098|21.45|solid
79|Au|Gold|196.97|known since antiquity|transition metal|[Xe] 4f14 5d10 6s1|2.54|890|+1, +3|1337.33|3129|19.3|solid
80|Hg|Mercury|200.59|known since antiquity|transition metal|[Xe] 4f14 5d10 6s2|2.00|1007|+1, +2|234.32|629.88|13.534|liquid
81|Tl|Thallium|204.38|William Crookes (1861)|post-transition metal|[Xe] 4f14 5d10 6s2 6p1|1.62|589|+1, +3|577|1746|11.85|solid
82|Pb|Lead|207.2|known since antiquity|post-transition metal|[Xe] 4f14 5d10 6s2 6p2|2.33|716|+2, +4|600.61|2022|11.34|solid
83|Bi|Bismuth|208.98|Claude François Geoffroy (1753)|post-transition metal|[Xe] 4f14 5d10 6s2 6p3|2.02|703|+3|544.7|1837|9.78|solid
84|Po|Polonium|[209]|Marie Curie, Pierre Curie (1898)|post-transition metal|[Xe] 4f14 5d10 6s2 6p4|2.0|812|+2, +4|527|1235|9.196|solid
85|At|Astatine|[210]|Dale Corson, Kenneth MacKenzie, Emilio Segrè (1940)|metalloid|[Xe] 4f14 5d10 6s2 6p5|2.2|899|−1, +1|~575|~610||solid
86|Rn|Radon|[222]|Friedrich Ernst Dorn (1900)|noble gas|[Xe] 4f14 5d10 6s2 6p6|2.2|1037|+2|202|211.3|9.73|gas
87|Fr|Francium|[223]|Marguerite Perey (1939)|alkali metal|[Rn] 7s1|0.79|393|+1|~300|~950||solid
88|Ra|Radium|[226]|Marie Curie, Pierre Curie (1898)|alkaline earth metal|[Rn] 7s2|0.9|509|+2|973|2010|5.5|solid
89|Ac|Actinium|[227]|André-Louis Debierne (1899)|actinide|[Rn] 6d1 7s2|1.1|499|+3|1323|3471|10|solid
90|Th|Thorium|232.04|Jöns Jacob Berzelius (1829)|actinide|[Rn] 6d2 7s2|1.3|587|+4|2023|5061|11.7|solid
91|Pa|Protactinium|231.04|Kasimir Fajans, Oswald Göhring (1913)|actinide|[Rn] 5f2 6d1 7s2|1.5|568|+5|1841|4300|15.37|solid
92|U|Uranium|238.03|Martin Heinrich Klaproth (1789)|actinide|[Rn] 5f3 6d1 7s2|1.38|598|+3, +4, +5, +6|1405.3|4404|19.1|solid
93|Np|Neptunium|[237]|Edwin McMillan, Philip Abelson (1940)|actinide|[Rn] 5f4 6d1 7s2|1.36|605|+3, +4, +5, +6, +7|917|4273|20.45|solid
94|Pu|Plutonium|[244]|Glenn T. Seaborg, Edwin McMillan, Joseph Kennedy, Arthur Wahl (1940)|actinide|[Rn] 5f6 7s2|1.28|585|+3, +4, +5, +6|912.5|3501|19.816|solid
95|Am|Americium|[243]|Glenn T. Seaborg, Ralph James, Leon Morgan, Albert Ghiorso (1944)|actinide|[Rn] 5f7 7s2|1.13|578|+3|1449|2880|12|solid
96|Cm|Curium|[247]|Glenn T. Seaborg, Ralph James, Albert Ghiorso (1944)|actinide|[Rn] 5f7 6d1 7s2|1.28|581|+3|1613|3383|13.51|solid
97|Bk|Berkelium|[247]|Stanley Thompson, Albert Ghiorso, Glenn T. Seaborg (1949)|actinide|[Rn] 5f9 7s2|1.3|601|+3, +4|1259|2900|14.78|solid
98|Cf|Californium|[251]|Stanley Thompson, Kenneth Street, Albert Ghiorso, Glenn T. Seaborg (1950)|actinide|[Rn] 5f10 7s2|1.3|608|+3|1173||15.1|solid
99|Es|Einsteinium|[252]|Albert Ghiorso and colleagues, Berkeley (1952)|actinide|[Rn] 5f11 7s2|1.3|619|+3|1133||8.84|solid
100|Fm|Fermium|[257]|Albert Ghiorso and colleagues, Berkeley (1952)|actinide|[Rn] 5f12 7s2|1.3|627|+3|~1800|||unknown
101|Md|Mendelevium|[258]|Albert Ghiorso, Bernard Harvey, Gregory Choppin, Stanley Thompson, Glenn T. Seaborg (1955)|actinide|[Rn] 5f13 7s2|1.3|635|+2, +3|~1100|||unknown
102|No|Nobelium|[259]|Joint Institute for Nuclear Research, Dubna (1966)|actinide|[Rn] 5f14 7s2|1.3|642|+2, +3|~1100|||unknown
103|Lr|Lawrencium|[266]|Berkeley and Dubna laboratories (1961–1971)|actinide|[Rn] 5f14 7s2 7p1||479|+3|~1900|||unknown
104|Rf|Rutherfordium|[267]|Dubna and Berkeley laboratories (1964–1969)|transition metal|[Rn] 5f14 6d2 7s2|||+4||||unknown
105|Db|Dubnium|[268]|Dubna and Berkeley laboratories (1968–1970)|transition metal|[Rn] 5f14 6d3 7s2|||+5||||unknown
106|Sg|Seaborgium|[269]|Albert Ghiorso and colleagues, Berkeley (1974)|transition metal|[Rn] 5f14 6d4 7s2|||+6||||unknown
107|Bh|Bohrium|[270]|Peter Armbruster, Gottfried Münzenberg, GSI Darmstadt (1981)|transition metal|[Rn] 5f14 6d5 7s2|||+7||||unknown
108|Hs|Hassium|[269]|Peter Armbruster, Gottfried Münzenberg, GSI Darmstadt (1984)|transition metal|[Rn] 5f14 6d6 7s2|||+8||||unknown
109|Mt|Meitnerium|[278]|Peter Armbruster, Gottfried Münzenberg, GSI Darmstadt (1982)|transition metal|[Rn] 5f14 6d7 7s2|||||||unknown
110|Ds|Darmstadtium|[281]|Sigurd Hofmann and colleagues, GSI Darmstadt (1994)|transition metal|[Rn] 5f14 6d8 7s2|||||||unknown
111|Rg|Roentgenium|[282]|Sigurd Hofmann and colleagues, GSI Darmstadt (1994)|transition metal|[Rn] 5f14 6d9 7s2|||||||unknown
112|Cn|Copernicium|[285]|Sigurd Hofmann and colleagues, GSI Darmstadt (1996)|transition metal|[Rn] 5f14 6d10 7s2|||+2||||unknown
113|Nh|Nihonium|[286]|Kosuke Morita and colleagues, RIKEN (2004)|post-transition metal|[Rn] 5f14 6d10 7s2 7p1|||||||unknown
114|Fl|Flerovium|[289]|Yuri Oganessian and colleagues, Dubna (1999)|post-transition metal|[Rn] 5f14 6d10 7s2 7p2|||||||unknown
115|Mc|Moscovium|[290]|Dubna and Livermore laboratories (2003)|post-transition metal|[Rn] 5f14 6d10 7s2 7p3|||||||unknown
116|Lv|Livermorium|[293]|Dubna and Livermore laboratories (2000)|post-transition metal|[Rn] 5f14 6d10 7s2 7p4|||||||unknown
117|Ts|Tennessine|[294]|Dubna, Oak Ridge, Vanderbilt and Livermore (2010)|halogen|[Rn] 5f14 6d10 7s2 7p5|||||||unknown
118|Og|Oganesson|[294]|Yuri Oganessian and colleagues, Dubna and Livermore (2002)|noble gas|[Rn] 5f14 6d10 7s2 7p6|||||||unknown`.split('\n').map(function (l) {
  var f = l.split('|');
  return { z: +f[0], sym: f[1], name: f[2], mass: f[3], by: f[4], cat: f[5], conf: f[6], en: f[7], ie: f[8], ox: f[9], mp: f[10], bp: f[11], rho: f[12], state: f[13] };
});

/* Where each element sits, and how its properties read: shared by the table and the element pages. */
(function () {
  var E = window.PERIODIC_ELEMENTS, ENDS = [2, 10, 18, 36, 54, 86, 118];
  function place(z) { // { period, group (0 for the f block), row, col } in the table's CSS grid
    var p = 0; while (z > ENDS[p]) p++;
    var first = p ? ENDS[p - 1] + 1 : 1, i = z - first, g;
    if (p === 0) g = z === 1 ? 1 : 18;
    else if (p < 3) g = i < 2 ? i + 1 : i + 11;
    else if (p < 5) g = i + 1;
    else if (i < 2) g = i + 1;
    else if (i < 17) return { period: p + 1, group: 0, row: p === 5 ? 10 : 11, col: i + 2 }; // La–Lu, Ac–Lr
    else g = i - 13;
    return { period: p + 1, group: g, row: p + 2, col: g + 1 };
  }
  function num(s) { var v = parseFloat(String(s || '').replace(/[~,]/g, '')); return isNaN(v) ? null : v; }
  E.forEach(function (e) {
    var p = place(e.z); e.period = p.period; e.group = p.group; e.row = p.row; e.col = p.col;
    e.block = e.group === 0 ? 'f' : e.group <= 2 || e.z === 2 ? 's' : e.group >= 13 ? 'p' : 'd';
    var y = /antiquity/.test(e.by) ? 0 : /(\d{4})/.exec(e.by); e.year = y === 0 ? 0 : y ? +y[1] : null;
    e.v = { en: num(e.en), ie: num(e.ie), mp: num(e.mp), bp: num(e.bp), year: e.year,
            rho: num(e.rho) === null ? null : e.state === 'gas' ? num(e.rho) / 1000 : num(e.rho) };
  });
  function sup(conf) { return conf.replace(/([spdf])(\d+)/g, '$1<sup>$2</sup>'); }
  function kelvin(s) { // "1811" → "1811 K (1538 °C)", keeping "~" and any note
    var m = /^(~?)([\d.]+)(.*)$/.exec(s || '');
    if (!m) return '—';
    var dec = (m[2].split('.')[1] || '').length, c = (parseFloat(m[2]) - 273.15).toFixed(dec);
    return m[1] + m[2] + ' K (' + m[1] + c.replace('-', '−') + ' °C)' + m[3];
  }
  function bigCell(z, sym, nm, ms, fill) {
    return '<div class="cell"' + (fill ? ' style="--fill:' + fill + '"' : '') + '><span class="z">' + z + '</span><span class="sym">' + sym +
      '</span><span class="nm">' + nm + '</span><span class="ms">' + ms + '</span></div>';
  }
  function discovered(e) { return e.by === 'known since antiquity' ? 'known since antiquity' : 'discovered by ' + e.by; }
  function props(e) { // the property list, as <dt>/<dd> pairs for a .props grid
    var rho = e.rho ? e.rho + (e.state === 'gas' ? ' g/L (0 °C)' : ' g/cm³') : '—';
    return [
      ['Category', e.cat], ['Block', e.block],
      ['Group', e.group || '3 (f block)'], ['Period', e.period],
      ['Configuration', sup(e.conf) + (e.z >= 109 ? ' <i>(predicted)</i>' : ''), 1],
      ['Electronegativity', e.en || '—'], ['1st ionisation', e.ie ? e.ie + ' kJ/mol' : '—'],
      ['Oxidation states', e.ox || '—', 1],
      ['Melting point', kelvin(e.mp), 1], ['Boiling point', kelvin(e.bp), 1],
      ['Density', rho], ['State, 25 °C', e.state]
    ].map(function (r) { return '<dt>' + r[0] + '</dt><dd' + (r[2] ? ' class="wide"' : '') + '>' + r[1] + '</dd>'; }).join('');
  }
  window.Periodic = { sup: sup, kelvin: kelvin, bigCell: bigCell, discovered: discovered, props: props };
})();
