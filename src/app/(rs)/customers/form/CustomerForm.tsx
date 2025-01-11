"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoaderCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { DisplayServerActionResponse } from "@/components/DisplayServerActionResponse";
import { CheckboxWithLabel } from "@/components/input/CheckboxWithLabel";
import { InputWithLabel } from "@/components/input/InputWithLabel";
import { SelectWithLabel } from "@/components/input/SelectWithLabel";
import { TextAreaWithLabel } from "@/components/input/TextAreaWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

import { saveCustomerAction } from "@/app/actions/saveCustomerAction";
import { StatesArray } from "@/constants/StatesArray";
import {
  insertCustomerSchema,
  type insertCustomerSchemaType,
  type selectCustomerSchemaType,
} from "@/zod-schemas/customer";

type Props = {
  customer?: selectCustomerSchemaType;
};

export default function CustomerForm({ customer }: Props) {
  const { getPermission, isLoading } = useKindeBrowserClient();
  const isManager = !isLoading && getPermission("manager")?.isGranted;

  const { toast } = useToast();

  const defaultValues: insertCustomerSchemaType = {
    id: customer?.id ?? 0,
    firstName: customer?.firstName ?? "",
    lastName: customer?.lastName ?? "",
    address1: customer?.address1 ?? "",
    address2: customer?.address2 ?? "",
    city: customer?.city ?? "",
    state: customer?.state ?? "",
    zip: customer?.zip ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    notes: customer?.notes ?? "",
    active: customer?.active ?? true,
  };

  const form = useForm<insertCustomerSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(insertCustomerSchema),
    defaultValues,
  });

  const {
    execute: executeSave,
    result: saveResult,
    isExecuting: isSaving,
    reset: resetSaveAction,
  } = useAction(saveCustomerAction, {
    onSuccess({ data }) {
      if (data?.message) {
        toast({
          variant: "default",
          title: "Success",
          description: data?.message,
        });
      }
    },
    onError({ error }) {
      //toast user
      toast({
        variant: "destructive",
        title: "Error",
        description: "Save Failed",
      });
    },
  });

  async function submitForm(data: insertCustomerSchemaType) {
    // console.log(data);
    executeSave(data);
  }

  return (
    <div className="flex flex-col gap-1 sm:px-8">
      <DisplayServerActionResponse result={saveResult} />
      <div>
        <h2 className="text-2xl font-bold">
          {customer?.id ? "Edit" : "New"} Customer
          {customer?.id ? `#${customer?.id}` : "form"}
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitForm)}
            className="flex flex-col gap-4 md:flex-row md:gap-8"
          >
            <div className="flex w-full max-w-xs flex-col gap-4">
              <InputWithLabel<insertCustomerSchemaType>
                fieldTitle="First Name"
                nameInSchema="firstName"
              />

              <InputWithLabel<insertCustomerSchemaType>
                fieldTitle="Last Name"
                nameInSchema="lastName"
              />

              <InputWithLabel<insertCustomerSchemaType>
                fieldTitle="Address 1"
                nameInSchema="address1"
              />

              <InputWithLabel<insertCustomerSchemaType>
                fieldTitle="Address 2"
                nameInSchema="address2"
              />

              <InputWithLabel<insertCustomerSchemaType>
                fieldTitle="City"
                nameInSchema="city"
              />

              <SelectWithLabel<insertCustomerSchemaType>
                fieldTitle="State"
                nameInSchema="state"
                data={StatesArray}
              />
            </div>

            <div className="flex w-full max-w-xs flex-col gap-4">
              <InputWithLabel<insertCustomerSchemaType>
                fieldTitle="Zip Code"
                nameInSchema="zip"
              />

              <InputWithLabel<insertCustomerSchemaType>
                fieldTitle="Email"
                nameInSchema="email"
              />

              <InputWithLabel<insertCustomerSchemaType>
                fieldTitle="Phone"
                nameInSchema="phone"
              />

              <TextAreaWithLabel<insertCustomerSchemaType>
                fieldTitle="Notes"
                nameInSchema="notes"
                className="h-40"
              />

              {isLoading ? (
                <p>Loading...</p>
              ) : isManager && customer?.id ? (
                <CheckboxWithLabel<insertCustomerSchemaType>
                  fieldTitle="Active"
                  nameInSchema="active"
                  message="Yes"
                />
              ) : null}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="w-3/4"
                  variant="default"
                  title="Save"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Saving
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  title="Reset"
                  onClick={() => {
                    form.reset(defaultValues);
                    resetSaveAction();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
