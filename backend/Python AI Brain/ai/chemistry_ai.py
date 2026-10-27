"""
ai/chemistry_ai.py  -  Mr.INIX Chemistry Helper (works offline)
================================================================
Used by ai/chatbot.py:

    try_chemistry(message)      -> instant answer, or None to let the AI answer
    chemistry_context(message)  -> extra AI instructions for chemistry questions

Instant answers (no internet, no API key)
-----------------------------------------
    "atomic number of gold"          "what is the symbol for iron?"
    "atomic mass of Fe"              "which element is number 26?"
    "molar mass of H2O"              "molecular weight of Ca(OH)2"
    "molar mass of glucose"          "formula mass of CuSO4.5H2O"

Anything else (reactions, explanations, ...) returns None, so the
connected AI model handles it.

Data note: atomic masses are standard textbook values (3 decimals).
Elements with no stable isotope show the mass number of their most
stable isotope, and the answer says so. Values for the heaviest
(superheavy) elements are approximate.
"""

import re

from ai.prompts import CHEMISTRY_ADDON

# ------------------------------------------------------------
# Periodic table: (symbol, name, atomic mass), index = Z - 1
# ------------------------------------------------------------
ELEMENTS = [
    ("H", "Hydrogen", 1.008), ("He", "Helium", 4.0026), ("Li", "Lithium", 6.94),
    ("Be", "Beryllium", 9.0122), ("B", "Boron", 10.81), ("C", "Carbon", 12.011),
    ("N", "Nitrogen", 14.007), ("O", "Oxygen", 15.999), ("F", "Fluorine", 18.998),
    ("Ne", "Neon", 20.180), ("Na", "Sodium", 22.990), ("Mg", "Magnesium", 24.305),
    ("Al", "Aluminium", 26.982), ("Si", "Silicon", 28.085), ("P", "Phosphorus", 30.974),
    ("S", "Sulfur", 32.06), ("Cl", "Chlorine", 35.45), ("Ar", "Argon", 39.948),
    ("K", "Potassium", 39.098), ("Ca", "Calcium", 40.078), ("Sc", "Scandium", 44.956),
    ("Ti", "Titanium", 47.867), ("V", "Vanadium", 50.942), ("Cr", "Chromium", 51.996),
    ("Mn", "Manganese", 54.938), ("Fe", "Iron", 55.845), ("Co", "Cobalt", 58.933),
    ("Ni", "Nickel", 58.693), ("Cu", "Copper", 63.546), ("Zn", "Zinc", 65.38),
    ("Ga", "Gallium", 69.723), ("Ge", "Germanium", 72.630), ("As", "Arsenic", 74.922),
    ("Se", "Selenium", 78.971), ("Br", "Bromine", 79.904), ("Kr", "Krypton", 83.798),
    ("Rb", "Rubidium", 85.468), ("Sr", "Strontium", 87.62), ("Y", "Yttrium", 88.906),
    ("Zr", "Zirconium", 91.224), ("Nb", "Niobium", 92.906), ("Mo", "Molybdenum", 95.95),
    ("Tc", "Technetium", 98), ("Ru", "Ruthenium", 101.07), ("Rh", "Rhodium", 102.906),
    ("Pd", "Palladium", 106.42), ("Ag", "Silver", 107.868), ("Cd", "Cadmium", 112.414),
    ("In", "Indium", 114.818), ("Sn", "Tin", 118.710), ("Sb", "Antimony", 121.760),
    ("Te", "Tellurium", 127.60), ("I", "Iodine", 126.904), ("Xe", "Xenon", 131.293),
    ("Cs", "Caesium", 132.905), ("Ba", "Barium", 137.327), ("La", "Lanthanum", 138.905),
    ("Ce", "Cerium", 140.116), ("Pr", "Praseodymium", 140.908), ("Nd", "Neodymium", 144.242),
    ("Pm", "Promethium", 145), ("Sm", "Samarium", 150.36), ("Eu", "Europium", 151.964),
    ("Gd", "Gadolinium", 157.25), ("Tb", "Terbium", 158.925), ("Dy", "Dysprosium", 162.500),
    ("Ho", "Holmium", 164.930), ("Er", "Erbium", 167.259), ("Tm", "Thulium", 168.934),
    ("Yb", "Ytterbium", 173.045), ("Lu", "Lutetium", 174.967), ("Hf", "Hafnium", 178.486),
    ("Ta", "Tantalum", 180.948), ("W", "Tungsten", 183.84), ("Re", "Rhenium", 186.207),
    ("Os", "Osmium", 190.23), ("Ir", "Iridium", 192.217), ("Pt", "Platinum", 195.084),
    ("Au", "Gold", 196.967), ("Hg", "Mercury", 200.592), ("Tl", "Thallium", 204.38),
    ("Pb", "Lead", 207.2), ("Bi", "Bismuth", 208.980), ("Po", "Polonium", 209),
    ("At", "Astatine", 210), ("Rn", "Radon", 222), ("Fr", "Francium", 223),
    ("Ra", "Radium", 226), ("Ac", "Actinium", 227), ("Th", "Thorium", 232.038),
    ("Pa", "Protactinium", 231.036), ("U", "Uranium", 238.029), ("Np", "Neptunium", 237),
    ("Pu", "Plutonium", 244), ("Am", "Americium", 243), ("Cm", "Curium", 247),
    ("Bk", "Berkelium", 247), ("Cf", "Californium", 251), ("Es", "Einsteinium", 252),
    ("Fm", "Fermium", 257), ("Md", "Mendelevium", 258), ("No", "Nobelium", 259),
    ("Lr", "Lawrencium", 266), ("Rf", "Rutherfordium", 267), ("Db", "Dubnium", 268),
    ("Sg", "Seaborgium", 269), ("Bh", "Bohrium", 270), ("Hs", "Hassium", 277),
    ("Mt", "Meitnerium", 278), ("Ds", "Darmstadtium", 281), ("Rg", "Roentgenium", 282),
    ("Cn", "Copernicium", 285), ("Nh", "Nihonium", 286), ("Fl", "Flerovium", 289),
    ("Mc", "Moscovium", 290), ("Lv", "Livermorium", 293), ("Ts", "Tennessine", 294),
    ("Og", "Oganesson", 294),
]

BY_SYMBOL = {sym: (z + 1, sym, name, mass) for z, (sym, name, mass) in enumerate(ELEMENTS)}
BY_NAME = {name.lower(): BY_SYMBOL[sym] for sym, name, _ in ELEMENTS}
BY_NAME.update({                       # alternative spellings
    "aluminum": BY_NAME["aluminium"], "sulphur": BY_NAME["sulfur"],
    "cesium": BY_NAME["caesium"],
})

# Elements with no stable isotope: the mass shown is a mass number.
NO_STABLE_ISOTOPE = {43, 61} | (set(range(84, 119)) - {90, 91, 92})

# ------------------------------------------------------------
# Common compounds (name -> formula) for "molar mass of glucose"
# ------------------------------------------------------------
COMPOUNDS = {
    "water": "H2O", "carbon dioxide": "CO2", "carbon monoxide": "CO",
    "methane": "CH4", "ethane": "C2H6", "propane": "C3H8", "butane": "C4H10",
    "ethanol": "C2H6O", "methanol": "CH4O", "glucose": "C6H12O6",
    "sucrose": "C12H22O11", "ammonia": "NH3", "hydrogen peroxide": "H2O2",
    "table salt": "NaCl", "salt": "NaCl", "sodium chloride": "NaCl",
    "sodium hydroxide": "NaOH", "potassium hydroxide": "KOH",
    "calcium carbonate": "CaCO3", "calcium hydroxide": "Ca(OH)2",
    "hydrochloric acid": "HCl", "sulfuric acid": "H2SO4", "sulphuric acid": "H2SO4",
    "nitric acid": "HNO3", "acetic acid": "C2H4O2", "baking soda": "NaHCO3",
    "sodium bicarbonate": "NaHCO3", "ozone": "O3", "benzene": "C6H6",
}

MAX_FORMULA_LEN = 40
MAX_COUNT       = 9999


# ------------------------------------------------------------
# Formula parser:  Ca(OH)2  ->  {"Ca": 1, "O": 2, "H": 2}
# ------------------------------------------------------------
def parse_formula(formula: str) -> dict:
    """Return {symbol: count} in order of first appearance. Raises ValueError."""
    if not formula or len(formula) > MAX_FORMULA_LEN:
        raise ValueError("bad length")

    total = {}
    for part in re.split(r"[\u00b7.*]", formula):        # hydrates: CuSO4.5H2O
        if not part:
            raise ValueError("empty part")
        m = re.match(r"^(\d+)(.+)$", part)
        coeff, body = (int(m.group(1)), m.group(2)) if m else (1, part)
        if coeff > MAX_COUNT:
            raise ValueError("coefficient too large")
        for sym, n in _parse_group(body).items():
            total[sym] = total.get(sym, 0) + n * coeff
            if total[sym] > MAX_COUNT * 10:
                raise ValueError("count too large")
    return total


def _parse_group(s: str) -> dict:
    stack, i = [{}], 0

    def read_number():
        nonlocal i
        j = i
        while j < len(s) and s[j].isdigit():
            j += 1
        n = int(s[i:j]) if j > i else 1
        i = j
        if n < 1 or n > MAX_COUNT:
            raise ValueError("bad count")
        return n

    def add(target, sym, n):
        target[sym] = target.get(sym, 0) + n

    while i < len(s):
        ch = s[i]
        if ch in "([":
            stack.append({})
            i += 1
        elif ch in ")]":
            if len(stack) < 2:
                raise ValueError("unbalanced")
            group = stack.pop()
            i += 1
            n = read_number()
            for sym, c in group.items():
                add(stack[-1], sym, c * n)
        elif ch.isupper():
            two = s[i:i + 2]
            if len(two) == 2 and two[1].islower() and two in BY_SYMBOL:
                sym = two
            elif ch in BY_SYMBOL:
                sym = ch
            else:
                raise ValueError(f"unknown element near {s[i:i + 2]}")
            i += len(sym)
            add(stack[-1], sym, read_number())
        else:
            raise ValueError(f"unexpected {ch!r}")

    if len(stack) != 1:
        raise ValueError("unbalanced")
    return stack[0]


def molar_mass(counts: dict) -> float:
    return sum(BY_SYMBOL[sym][3] * n for sym, n in counts.items())


# ------------------------------------------------------------
# Answer builders
# ------------------------------------------------------------
def element_line(z, sym, name, mass) -> str:
    mass_txt = f"{mass:g}"
    note = " (mass number of its most stable isotope)" if z in NO_STABLE_ISOTOPE else ""
    return (f"{name} ({sym}): atomic number {z}, "
            f"atomic mass {mass_txt}{note}.")


def molar_mass_answer(label: str, formula: str):
    try:
        counts = parse_formula(formula)
    except ValueError:
        return None
    lines = [f"Molar mass of {label}: {molar_mass(counts):.3f} g/mol"]
    for sym, n in counts.items():
        m = BY_SYMBOL[sym][3]
        lines.append(f"{sym}: {n} x {m:g} = {m * n:.3f}")
    if any(BY_SYMBOL[s][0] in NO_STABLE_ISOTOPE for s in counts):
        lines.append("(Includes a radioactive element, so its mass is approximate.)")
    return "\n".join(lines)


# ------------------------------------------------------------
# Message matching
# ------------------------------------------------------------
RE_MOLAR = re.compile(
    r"\b(?:molar|molecular|formula)\s+(?:mass|weight)\b"
    r"(?:\s+(?:of|for))?\s+(.+?)\s*[?.!]*\s*$", re.IGNORECASE)

RE_ELEMENT_INTENT = re.compile(
    r"\b(?:atomic\s+(?:number|mass|weight)|symbol|periodic\s+table|element)\b",
    re.IGNORECASE)

RE_NUMBER = re.compile(r"\b(\d{1,3})\b")
RE_TOKEN  = re.compile(r"[A-Za-z]{1,3}")

MAX_WORDS = 14       # long messages go to the AI instead
# A bare symbol like "I" or "As" only counts right after one of these words,
# so "what element should I pick" is not read as iodine.
SYMBOL_LEAD_WORDS = {"of", "for", "is", "symbol", "element", "as"}


def try_chemistry(message: str):
    """Instant answer for simple element / molar-mass questions, else None."""
    try:
        return _answer(message)
    except Exception as err:             # never break the chat
        print(f"[Mr.INIX] chemistry_ai error: {err}")
        return None


def _answer(message: str):
    text = message.strip()
    if not text or len(text.split()) > MAX_WORDS:
        return None

    # --- Molar mass ----------------------------------------
    m = RE_MOLAR.search(text)
    if m:
        target = m.group(1).strip().strip("\"'")
        if target.lower() in COMPOUNDS:
            return molar_mass_answer(target.lower(), COMPOUNDS[target.lower()])
        if " " not in target and re.search(r"[A-Z]", target):
            return molar_mass_answer(target, target)
        return None                       # unclear -> let the AI handle it

    # --- Element lookups -----------------------------------
    if not RE_ELEMENT_INTENT.search(text):
        return None

    lowered = text.lower()
    found = {}                                          # 1) by name (max 3)
    for name, data in BY_NAME.items():
        if re.search(rf"\b{name}\b", lowered):
            found[data[0]] = data
    if found:
        return "\n".join(element_line(*d) for d in sorted(found.values())[:3])

    nums = [int(n) for n in RE_NUMBER.findall(text)]   # 2) by number
    for n in nums:
        if 1 <= n <= 118:
            return element_line(*BY_SYMBOL[ELEMENTS[n - 1][0]])

    words = text.split()                                # 3) by symbol (exact case)
    for idx, word in enumerate(words):                  #    must follow of/for/is/symbol...
        token = word.strip("?.!,;:\"'()")
        prev = words[idx - 1].lower().strip("?.!,;:") if idx > 0 else ""
        if prev in SYMBOL_LEAD_WORDS and RE_TOKEN.fullmatch(token) and token in BY_SYMBOL:
            return element_line(*BY_SYMBOL[token])

    return None


# ------------------------------------------------------------
# Extra AI instructions for chemistry-related messages
# ------------------------------------------------------------
RE_CHEM_WORDS = re.compile(
    r"\b(?:chemi(?:stry|cal)|molecule|molecular|compound|reaction|acid|base|alkali|"
    r"element|periodic|atom|atomic|ion|ionic|bond|mole|molar|equation|titration|"
    r"oxidation|reduction|redox|electron|isotope|solution|solvent|catalyst|"
    r"organic|polymer|valence|ph)\b", re.IGNORECASE)


def chemistry_context(message: str) -> str:
    """Extra instructions for the AI when the message looks chemistry-related."""
    return CHEMISTRY_ADDON if RE_CHEM_WORDS.search(message or "") else ""
