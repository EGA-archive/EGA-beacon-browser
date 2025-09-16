describe("Navigation", () => {
  it("Navbar is visible", () => {
    cy.visit("/");
    cy.get(".custom-navbar").should("be.visible");
  });

  it("Navbar contains title", () => {
    cy.visit("/");
    cy.get("h1").contains("EGA Allele Frequency Browser");
  });

  it("Navbar has EGA logo", () => {
    cy.visit("/");
    cy.get("img.egalogo")
      .should("have.attr", "src")
      .and("include", "/egalogo.png");
  });

  it("EGA logo is visible", () => {
    cy.visit("/");
    cy.get("img.egalogo").should("be.visible");
  });

  it("Clicking the EGA logo redirects to the correct link", () => {
    cy.visit("/");
    cy.get("a")
      .should("have.attr", "href", "https://ega-archive.org/about/ega/")
      .and("have.attr", "target", "_blank");
  });
});
