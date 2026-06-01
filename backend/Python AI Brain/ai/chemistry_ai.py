class ChemistryAI:

    def __init__(self):
        self.name = "Mr.INIX Chemistry Engine"

    def answer(self, question):

        question = question.lower()

        if "water" in question:
            return {
                "name": "Water",
                "formula": "H₂O",
                "description": "Water is a chemical compound consisting of hydrogen and oxygen."
            }

        elif "salt" in question:
            return {
                "name": "Sodium Chloride",
                "formula": "NaCl",
                "description": "Common table salt used in food and industry."
            }

        elif "methane" in question:
            return {
                "name": "Methane",
                "formula": "CH₄",
                "description": "The simplest alkane and a major component of natural gas."
            }

        elif "acetic acid" in question:
            return {
                "name": "Acetic Acid",
                "formula": "CH₃COOH",
                "description": "A weak acid commonly found in vinegar."
            }

        return {
            "name": "Unknown Compound",
            "formula": "N/A",
            "description": "Compound not found in local chemistry database."
        }