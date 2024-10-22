/**
 * @jest-environment jsdom
 */
import { screen, waitFor, fireEvent } from "@testing-library/dom"
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

  describe("When I upload a file in a correct format (jpg, jpeg, png)", () => {
    test("Then no error message should be displayed, and the file should be uploaded", async () => {
      // Setup: Render the NewBill page UI
      document.body.innerHTML = NewBillUI()
  
      const onNavigate = jest.fn()
      const store = mockStore
  
      // Simuler la connexion d'un utilisateur de type 'Employee'
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
  
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
  
      // Vérifier que l'état initial du message d'erreur est bien "none" via getComputedStyle
      const errorMessage = screen.getByTestId('file-error')
  
      // Simuler l'ajout d'un fichier valide
      const fileInput = screen.getByTestId("file")
      const file = new File(['(file content)'], 'testFile.png', { type: 'image/png' })
  
      // Simuler l'événement "change" sur l'input de fichier
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener("change", handleChangeFile)
      userEvent.upload(fileInput, file)
  
      // Vérifier que handleChangeFile a bien été appelé
      expect(handleChangeFile).toHaveBeenCalled()
  
      // Vérifier que le message d'erreur n'est toujours pas affiché après avoir uploadé un fichier valide
      expect(getComputedStyle(errorMessage).display).toBe("none")
    })
  })      

  describe("When I upload a file in an incorrect format (e.g. txt)", () => {
    test("Then an error message should be displayed", async () => {
      // Setup: Render the NewBill page UI
      document.body.innerHTML = NewBillUI()
  
      // Mock the behavior of localStorage and onNavigate
      const onNavigate = jest.fn()
      const store = mockStore
  
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
  
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
  
      // Simuler l'ajout d'un fichier invalide
      const fileInput = screen.getByTestId("file")
      const file = new File(['(file content)'], 'testFile.txt', { type: 'text/plain' })
  
      // Simuler l'événement "change" sur l'input de fichier
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      fileInput.addEventListener("change", handleChangeFile)
      userEvent.upload(fileInput, file)
  
      // Vérifier que handleChangeFile a bien été appelé
      expect(handleChangeFile).toHaveBeenCalled()
  
      // Vérifier que le message d'erreur est affiché
      const errorMessage = screen.getByTestId('file-error')
      expect(errorMessage.style.display).toBe("block")
    })
  })

  describe("When I submit the form", () => {
    test("Then handleSubmit should be called", async () => {
      // Setup: Render the NewBill page UI
      document.body.innerHTML = NewBillUI()

      // Mock the behavior of localStorage and onNavigate
      const onNavigate = jest.fn()
      const store = mockStore
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })

      // Simuler l'événement submit sur le formulaire
      const formNewBill = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      formNewBill.addEventListener("submit", handleSubmit)

      // Simuler le clic sur le bouton "Envoyer"
      const submitButton = screen.getByText("Envoyer")
      userEvent.click(submitButton)

      // Vérifier que handleSubmit a bien été appelé
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

})

// Méthode POST de NewBill
describe("When I am on NewBill Page and I submit a new bill", () => {
  test("Then the bill should be posted to the API POST", async () => {
    document.body.innerHTML = NewBillUI()
    window.onNavigate(ROUTES_PATH.NewBill)
    const bill = await mockStore.bills().create();
    expect(bill.key).toBe("1234");
  })
})