import FormBudget from "./form-budget";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

const DialogBudgetForm = ({ isOpen, onClose, categorias, budget, isEdit }) => {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-4xl h-screen max-h-[90vh] overflow-auto">
          <DialogTitle>
            <h3 className="text-2xl font-bold mb-4 text-primary px-16">
              {isEdit ? "Editar Orçamento" : "Adicionar Orçamento"}
            </h3>
          </DialogTitle>
          <FormBudget
            categorias={categorias}
            budget={budget}
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogBudgetForm;
