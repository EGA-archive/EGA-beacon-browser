describe("NetworkMembers section", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays the section title", () => {
    cy.get("p.institution-title")
      .should("be.visible")
      .and("contain", "Institutions involved");
  });

  it("displays exactly 3 institution logos", () => {
    cy.get(".bnmembers-grid .cell").should("have.length", 3);
  });

  it("EGA logo is correct", () => {
    cy.get(".egaembllogo")
      .first()
      .should("have.attr", "src")
      .and("include", "egalogocolor.png");
    cy.get(".egaembllogo")
      .first()
      .parents("a")
      .should("have.attr", "href", "https://ega-archive.org/")
      .and("have.attr", "target", "_blank");
  });

  it("CRG logo is correct", () => {
    cy.get(".crglogo").should("have.attr", "src").and("include", "crglogo.png");
    cy.get(".crglogo")
      .parents("a")
      .should("have.attr", "href", "https://www.crg.eu/")
      .and("have.attr", "target", "_blank");
  });

  it("EMBL-EBI logo is correct", () => {
    cy.get(".egaembllogo")
      .eq(1)
      .should("have.attr", "src")
      .and("include", "embllogo.png");
    cy.get(".egaembllogo")
      .eq(1)
      .parents("a")
      .should("have.attr", "href", "https://www.ebi.ac.uk/")
      .and("have.attr", "target", "_blank");
  });
});
