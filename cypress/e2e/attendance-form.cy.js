describe('Attendance Form Page - M&AT Group', () => {
  const years = ['First Year', 'Second Year']


  beforeEach(() => {
  cy.session('lecturer', () => {
    cy.visit('http://localhost:3000/lecturer/login')
    cy.get('input[name="email"]').type('venkat.bvp34@gmail.com')
    cy.get('input[name="password"]').type('venkat471971')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/dashboard')
  })
})


  years.forEach((year) => {
    it(`should allow marking attendance for M&AT students - ${year}`, () => {
      cy.visit('http://localhost:3000/attendance-form')

      // Date select చేయడం
      cy.get('input[type="date"]').type('2025-09-15')

      // Year select చేయడం
      cy.get('select').first().select(year)

      // Group select చేయడం
      cy.get('select').last().select('M&AT')

      // Students load అయ్యే వరకు wait చేయడం
      cy.get('.grid .bg-white', { timeout: 10000 }).should('exist')

      // కనీసం ఒక student card ఉన్నదో లేదో check
      cy.get('.grid .bg-white').should('have.length.greaterThan', 0)

      // ఒక student card లో Present button క్లిక్ చేయడం
      cy.get('.grid .bg-white').first().within(() => {
        cy.contains('Present').click()
      })

      // Attendance submit చేయడం
      cy.contains('Submit Attendance').click()

      // Toast message check చేయడం
      cy.contains('Attendance submitted successfully!', { timeout: 10000 })
        .should('be.visible')
    })
  })
})
