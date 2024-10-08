/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes" // ROUTES_PATHS ADDED
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // to-do write expect expression (Test for Highlighting the Bills Icon)
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe('Given I am connected as an employee and I am on Bills page and I clicked on the icon', () => {
    describe('When I click on the icon eye', () => {
      test('A modal should open', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({data:bills})
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bill = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })
  
        $.fn.modal = jest.fn()
        const eye = screen.getAllByTestId('icon-eye')[0]
        const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye))
        eye.addEventListener('click', handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()
  
        const modale = document.getElementById('modaleFile')
        expect(modale).toBeTruthy()
      })
    })
  })
})

// Test d'intégration GET pour l'employé
  describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills page", () => {
      test("fetches bills from mock API GET and displays them in the table", async () => {
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.com" }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
      
        // Attendre que les factures soient chargées et affichées
        await waitFor(() => screen.getByText("Mes notes de frais"))
      
        // Sélectionne le tableau où les factures doivent apparaître
        const billsTableBody = screen.getByTestId("tbody")
        expect(billsTableBody).toBeTruthy()
      
        // Vérifie qu'il y a bien des lignes dans le tableau (donc des factures affichées)
        const rows = screen.getAllByRole("row")  // Sélectionne toutes les lignes du tableau
        console.log("Rows in table:", rows.length)  // Affiche le nombre de lignes (y compris l'en-tête)
      
        expect(rows.length).toBeGreaterThan(1)  // On s'attend à avoir au moins 2 lignes : en-tête + au moins une facture
      })   

      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills")
          Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
          )
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: "employee@test.com"
          }))
          const root = document.createElement("div")
          document.body.appendChild(root)
          router()
        })

        test("fetches bills from an API and fails with 404 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }
          })
        
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 404/)
          console.log("Error Message:", message)  // Voir le message d'erreur dans la console
          expect(message).toBeTruthy()
        })
        

        test("fetches bills from an API and fails with 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }})
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
      })
    })
})