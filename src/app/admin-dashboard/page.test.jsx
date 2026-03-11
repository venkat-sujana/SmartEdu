/// <reference types="cypress" />

describe.only('AdminDashboard Page', () => {
    beforeEach(() => {
        cy.visit('/admin-dashboard', {
            onBeforeLoad(win) {
                // Default: allow access
                win.localStorage.setItem('admin-auth', 'true');
            }
        });
    });

    it('renders the dashboard when admin-auth is true', () => {
        cy.contains('🔑 Admin Dashboard').should('exist');
        cy.contains('Lecturer Login').should('exist');
        cy.contains('Principal Login').should('exist');
    });

    it('redirects to /admin-login if admin-auth is not true', () => {
        cy.visit('/admin-dashboard', {
            onBeforeLoad(win) {
                win.localStorage.setItem('admin-auth', 'false');
            }
        });
        cy.location('pathname').should('eq', '/admin-login');
    });

    it('redirects to /admin-login if admin-auth is missing', () => {
        cy.visit('/admin-dashboard', {
            onBeforeLoad(win) {
                win.localStorage.removeItem('admin-auth');
            }
        });
        cy.location('pathname').should('eq', '/admin-login');
    });

    it('navigates to /lecturer/login when Lecturer Login is clicked', () => {
        cy.contains('Lecturer Login').click();
        cy.location('pathname').should('eq', '/lecturer/login');
    });

    it('navigates to /principal/login when Principal Login is clicked', () => {
        cy.contains('Principal Login').click();
        cy.location('pathname').should('eq', '/principal/login');
    });


});