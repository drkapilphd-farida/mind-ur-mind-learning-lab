import { ExerciseProgressBar } from '@/components/exercises/ExerciseProgressBar'

type QuestionProgressHeaderProps = {
  currentQuestionNumber: number
  totalQuestions: number
}

export function QuestionProgressHeader({ currentQuestionNumber, totalQuestions }: QuestionProgressHeaderProps): React.JSX.Element {
  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Question {currentQuestionNumber} / {totalQuestions}
      </p>
      <ExerciseProgressBar progress={(currentQuestionNumber - 1) / totalQuestions} />
    </div>
  )
}
