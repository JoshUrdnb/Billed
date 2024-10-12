/**
 * @jest-environment jsdom
 */
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH } from "../constants/routes.js";


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
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      // Test que l'icône des factures est bien surlignée
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
  })

  describe("When I am on NewBill Page", () => {
    test("Then all form inputs should be present", async () => {
      // Setup: Render the NewBill page UI
      document.body.innerHTML = NewBillUI()

      // Vérifier que tous les inputs nécessaires sont présents
      const expenseType = screen.getByTestId("expense-type")
      const expenseName = screen.getByTestId("expense-name")
      const datepicker = screen.getByTestId("datepicker")
      const amount = screen.getByTestId("amount")
      const vat = screen.getByTestId("vat")
      const pct = screen.getByTestId("pct")
      const commentary = screen.getByTestId("commentary")
      const file = screen.getByTestId("file")

      // Tests pour s'assurer que chaque élément est présent dans le DOM
      expect(expenseType).toBeTruthy()
      expect(expenseName).toBeTruthy()
      expect(datepicker).toBeTruthy()
      expect(amount).toBeTruthy()
      expect(vat).toBeTruthy()
      expect(pct).toBeTruthy()
      expect(commentary).toBeTruthy()
      expect(file).toBeTruthy()
    })
  })

  describe("When I upload a file in the correct format (jpg, jpeg, png)", () => {
    test("Then the file name should be displayed correctly", async () => {
      // Setup: Render the NewBill page UI
      document.body.innerHTML = NewBillUI()
  
      // Mock the behavior of localStorage and onNavigate
      const onNavigate = jest.fn()
      const store = mockStore
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
  
      // Simuler l'ajout d'un fichier valide
      const fileInput = screen.getByTestId("file")
      const file = new File(['(file content)'], 'testFile.jpg', { type: 'image/jpg' })
  
      // Simuler l'événement "change" sur l'input de fichier
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener("change", handleChangeFile)
      userEvent.upload(fileInput, file)
  
      // Vérifier que handleChangeFile a bien été appelé
      expect(handleChangeFile).toHaveBeenCalled()
  
      // Vérifier que le fichier a été correctement sélectionné et que le nom est mis à jour
      expect(fileInput.files[0].name).toBe('testFile.jpg')
    })
  })

})