describe("Footer", () => {
  it("Footer is visible", () => {
    cy.visit("/");
    cy.get(".custom-footer").should("be.visible");
  });

  it("Footer contains correct text", () => {
    cy.visit("/");
    cy.get(".footer-text").should("contain", "@Copyright 2024. EGA CONSORTIUM");
  });
});
