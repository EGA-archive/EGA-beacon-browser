describe("Navigation", function () {
  it("Navbar contains title", function () {
    cy.visit("/");
    cy.get("h1").contains("EGA Allele Frequency Browser");
  });

  it("Navbar has EGA logo", function () {
    cy.visit("/");
    cy.get(".egalogo img")
      .should("have.attr", "src")
      .and("include", "/egalogo.png");
  });

  it("Clicking the EGA logo redirects to the correct link", function () {
    cy.visit("/");
    cy.get("a.egalogo")
      .should("have.attr", "href", "https://ega-archive.org/about/ega/")
      .and("have.attr", "target", "_blank");
  });
});
